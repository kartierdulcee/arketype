import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { getSessionFromRequest } from "../lib/session";
import { getStripe } from "../lib/stripe";

const WELCOME_MESSAGE = "Hello! I’m Arketype, your AI prompt optimizer. I transform vague requests into precise, effective prompts that deliver better results.";

function parseAssistantResponse(text) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const summary = {
    raw: text,
    mode: null,
    optimizedPrompt: "",
    whatChanged: "",
    keyImprovements: "",
    techniquesApplied: "",
    proTip: "",
  };

  lines.forEach((line) => {
    const dividerIndex = line.indexOf(":");
    if (dividerIndex === -1) {
      return;
    }

    const label = line.slice(0, dividerIndex).trim();
    const value = line.slice(dividerIndex + 1).trim();

    if (!value) {
      return;
    }

    const normalizedLabel = label.toLowerCase();

    if (normalizedLabel === "mode") {
      summary.mode = value.toUpperCase();
    } else if (normalizedLabel === "your optimized prompt") {
      summary.optimizedPrompt = value;
    } else if (normalizedLabel === "what changed") {
      summary.whatChanged = value;
    } else if (normalizedLabel === "key improvements") {
      summary.keyImprovements = value;
    } else if (normalizedLabel === "techniques applied") {
      summary.techniquesApplied = value;
    } else if (normalizedLabel === "pro tip") {
      summary.proTip = value;
    }
  });

  return summary;
}

function ConversationBubble({ role, content }) {
  const isAssistant = role === "assistant";
  const summary = useMemo(() => (isAssistant ? parseAssistantResponse(content) : null), [isAssistant, content]);

  if (!isAssistant) {
    return (
      <div className="flex justify-end">
        <div className="max-w-xl rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-soft">
          {content}
        </div>
      </div>
    );
  }

  if (!summary.optimizedPrompt) {
    return (
      <div className="flex justify-start">
        <div className="max-w-xl rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-xl space-y-3 rounded-2xl bg-white px-5 py-4 text-left text-sm text-slate-700 shadow">
        {summary.mode && (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Mode · {summary.mode}</p>
        )}
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Your Optimized Prompt</p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{summary.optimizedPrompt}</p>
        </div>
        {(summary.whatChanged || summary.keyImprovements) && (
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              {summary.whatChanged ? "What Changed" : "Key Improvements"}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {summary.whatChanged || summary.keyImprovements}
            </p>
          </div>
        )}
        {summary.techniquesApplied && (
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Techniques Applied</p>
            <p className="mt-1 text-sm text-slate-700">{summary.techniquesApplied}</p>
          </div>
        )}
        {summary.proTip && (
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Pro Tip</p>
            <p className="mt-1 text-sm text-slate-700">{summary.proTip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage({ email }) {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [modePreference, setModePreference] = useState("AUTO");
  const [targetAi, setTargetAi] = useState("ChatGPT");
  const [sessionStats, setSessionStats] = useState({ total: 0, detail: 0 });
  const [latestSummary, setLatestSummary] = useState(null);
  const [history, setHistory] = useState([]);

  const detailUsage = sessionStats.total
    ? Math.round((sessionStats.detail / sessionStats.total) * 100)
    : 0;

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to sign out.");
      }
      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const formattedPrompt = `Target AI: ${targetAi}\nMode Preference: ${modePreference}\nPrompt: ${input}`;

    const newUserMessage = { role: "user", content: formattedPrompt };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsProcessing(true);
    setError("");

    try {
      const conversation = updatedMessages
        .filter((message, index) => !(index === 0 && message.role === "assistant"));

      const response = await fetch("/api/mistral-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation,
          preferredMode: modePreference !== "AUTO" ? modePreference : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to optimize prompt right now.");
      }

      const data = await response.json();
      const assistantMessage = { role: "assistant", content: data.message };
      const nextMessages = [...updatedMessages, assistantMessage];
      setMessages(nextMessages);

      const parsed = parseAssistantResponse(data.message);

      if (parsed.optimizedPrompt) {
        setLatestSummary({ ...parsed, targetAi, createdAt: new Date().toISOString() });
        setHistory((prev) => [
          { ...parsed, targetAi, createdAt: new Date().toISOString() },
          ...prev,
        ].slice(0, 6));

        setSessionStats((prev) => {
          const total = prev.total + 1;
          const detail = parsed.mode === "DETAIL" ? prev.detail + 1 : prev.detail;
          return { total, detail };
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden w-72 flex-shrink-0 border-r border-slate-200 bg-white/70 px-6 py-8 md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">AK</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Arketype Studio</p>
              <p className="text-xs text-slate-500">Prompt Intelligence Hub</p>
            </div>
          </div>
          <div className="mt-6">
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <nav className="mt-8 space-y-6 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prompt Engine</p>
              <ul className="mt-3 space-y-2">
                <li className="rounded-xl bg-slate-900/5 px-3 py-2 font-medium text-slate-900">Prompt Optimizer</li>
                <li className="rounded-xl px-3 py-2 text-slate-500">Prompt Library</li>
                <li className="rounded-xl px-3 py-2 text-slate-500">Persona Builder</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Insights</p>
              <ul className="mt-3 space-y-2">
                <li className="rounded-xl px-3 py-2 text-slate-500">Usage Analytics</li>
                <li className="rounded-xl px-3 py-2 text-slate-500">Prompt Experiments</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Workflows</p>
              <ul className="mt-3 space-y-2">
                <li className="rounded-xl px-3 py-2 text-slate-500">Team Review</li>
                <li className="rounded-xl px-3 py-2 text-slate-500">Integrations</li>
              </ul>
            </div>
          </nav>
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Need a custom workflow?</p>
            <p className="mt-2 text-xs text-slate-500">Book a strategy session with Arketype to tailor prompt systems for your team.</p>
            <button className="mt-4 w-full rounded-full bg-slate-900 py-2 text-xs font-semibold text-white">Schedule Call</button>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto px-6 py-10 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">AI Consultant</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">Prompt Optimization Control Room</h1>
              <p className="mt-1 text-sm text-slate-500">Signed in as {email}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={targetAi}
                onChange={(event) => setTargetAi(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option>ChatGPT</option>
                <option>Claude</option>
                <option>Gemini</option>
                <option>Other</option>
              </select>
              <select
                value={modePreference}
                onChange={(event) => setModePreference(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="AUTO">Mode: Auto Detect</option>
                <option value="BASIC">Mode: Basic</option>
                <option value="DETAIL">Mode: Detail</option>
              </select>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:-translate-y-0.5 hover:shadow"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prompts Optimized</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{sessionStats.total}</p>
              <p className="mt-1 text-xs text-emerald-600">Live session</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Detail Mode Usage</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{detailUsage}%</p>
              <p className="mt-1 text-xs text-slate-500">Based on recent interactions</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Target AI</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{targetAi}</p>
              <p className="mt-1 text-xs text-slate-500">Editable per request</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mode Preference</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{modePreference}</p>
              <p className="mt-1 text-xs text-slate-500">Override available anytime</p>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="rounded-3xl border border-slate-200 bg-white shadow-soft">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Optimization Console</h2>
                    <p className="mt-1 text-sm text-slate-500">Share your prompt or question. Arketype applies the 4-D methodology automatically.</p>
                  </div>
                  {latestSummary?.mode && (
                    <div className="rounded-full bg-brand/10 px-4 py-2 text-xs font-semibold text-brand">Current Mode · {latestSummary.mode}</div>
                  )}
                </div>
              </div>
              <div className="flex max-h-[520px] flex-col justify-between">
                <div className="space-y-4 overflow-y-auto px-6 py-6">
                  {messages.map((message, index) => (
                    <ConversationBubble key={index} role={message.role} content={message.content} />
                  ))}
                  {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
                </div>
                <div className="border-t border-slate-200 px-6 py-5">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={3}
                    placeholder="Describe what you need help optimizing..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Enter to send · Shift + Enter for new line</p>
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={isProcessing}
                      className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                    >
                      {isProcessing ? "Optimizing…" : "Send to Arketype"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-soft">
                <h3 className="text-base font-semibold text-slate-900">Prompt Intelligence</h3>
                <p className="mt-2 text-xs text-slate-500">Snapshot of the latest optimization.</p>
                {latestSummary ? (
                  <div className="mt-4 space-y-4 text-sm text-slate-700">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">Mode</p>
                      <p className="mt-1 font-semibold text-slate-900">{latestSummary.mode}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">Optimized Prompt</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{latestSummary.optimizedPrompt}</p>
                    </div>
                    {(latestSummary.whatChanged || latestSummary.keyImprovements) && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          {latestSummary.whatChanged ? "What Changed" : "Key Improvements"}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {latestSummary.whatChanged || latestSummary.keyImprovements}
                        </p>
                      </div>
                    )}
                    {latestSummary.techniquesApplied && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Techniques Applied</p>
                        <p className="mt-1 text-sm text-slate-700">{latestSummary.techniquesApplied}</p>
                      </div>
                    )}
                    {latestSummary.proTip && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Pro Tip</p>
                        <p className="mt-1 text-sm text-slate-700">{latestSummary.proTip}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">Send a prompt to see Arketype&apos;s recommendations.</p>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-soft">
                <h3 className="text-base font-semibold text-slate-900">Recent Optimizations</h3>
                <p className="mt-2 text-xs text-slate-500">Chronicle of your latest prompt upgrades.</p>
                <div className="mt-4 space-y-4">
                  {history.length === 0 && (
                    <p className="text-sm text-slate-500">No history yet. Start by optimizing a prompt.</p>
                  )}
                  {history.map((entry, index) => (
                    <div key={`${entry.createdAt}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">{entry.mode} · {entry.targetAi}</p>
                      <p className="mt-1 text-sm font-medium text-slate-800 truncate">{entry.optimizedPrompt}</p>
                      {(entry.whatChanged || entry.keyImprovements) && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          {entry.whatChanged || entry.keyImprovements}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const session = getSessionFromRequest(req);

  if (!session?.sub) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("Stripe configuration error", error);
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const customer = await stripe.customers.retrieve(session.sub);

    if (!customer?.metadata?.arketype_password_hash) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const subscriptionId = customer.metadata.arketype_subscription_id;

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.status !== "active") {
        return {
          redirect: {
            destination: "/login?status=inactive",
            permanent: false,
          },
        };
      }
    }

    return {
      props: { email: customer.email || session.email || "" },
    };
  } catch (error) {
    console.error("Dashboard session error", error);
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
}
