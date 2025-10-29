import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/Navbar";

const STATUS = {
  loading: "loading",
  ready: "ready",
  error: "error",
  accountExists: "exists",
  completed: "completed",
};

export default function SuccessPage() {
  const router = useRouter();
  const sessionId = useMemo(() => router.query.session_id, [router.query.session_id]);
  const [status, setStatus] = useState(STATUS.loading);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionId || typeof sessionId !== "string") {
      setStatus(STATUS.error);
      setMessage("Missing checkout session. Please contact support if this persists.");
      return;
    }

    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch(`/api/checkout-session?session_id=${sessionId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.message || "Unable to confirm your checkout.");
        }

        const data = await response.json();
        setCheckoutDetails(data);

        if (data.mode === "subscription") {
          if (data.accountExists) {
            setStatus(STATUS.accountExists);
            setMessage("Looks like you already have an account. Sign in to continue.");
          } else {
            setStatus(STATUS.ready);
          }
        } else {
          setStatus(STATUS.completed);
          setMessage("Payment confirmed. Check your inbox for download details.");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus(STATUS.error);
          setMessage(error.message);
        }
      }
    }

    loadSession();
    return () => controller.abort();
  }, [sessionId]);

  const handleAccountSetup = async (event) => {
    event.preventDefault();

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Try again.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to complete account setup.");
      }

      router.push("/dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-white/70">
        <div className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-20 md:px-10">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-soft">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
              🎉 Payment complete
            </span>

            <h1 className="mt-8 text-3xl font-semibold text-slate-900 sm:text-4xl">
              You are officially in the Arketype crew
            </h1>

            {status === STATUS.loading && (
              <p className="mt-6 text-lg text-slate-600">Confirming your membership&hellip;</p>
            )}

            {status === STATUS.completed && (
              <div className="mt-8 space-y-6 text-slate-600">
                <p>Thanks for your purchase! Your resources are on the way to your inbox.</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/products"
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    Explore More Prompts
                  </Link>
                  <Link
                    href="/"
                    className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-400 hover:-translate-y-1 hover:shadow"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}

            {status === STATUS.ready && (
              <div className="mt-10 text-left">
                <h2 className="text-xl font-semibold text-slate-900">Create your member account</h2>
                <p className="mt-3 text-sm text-slate-600">
                  Use a password you&apos;ll remember. We&apos;ll match your new login to the email associated
                  with your Stripe checkout.
                </p>
                {checkoutDetails?.customerEmail && (
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Account email: {checkoutDetails.customerEmail}
                  </p>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleAccountSetup}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  {message && <p className="text-sm font-medium text-red-600">{message}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg disabled:translate-y-0 disabled:bg-slate-400 disabled:shadow-none"
                  >
                    {submitting ? "Setting up your account…" : "Create account and continue"}
                  </button>
                </form>
              </div>
            )}

            {status === STATUS.accountExists && (
              <div className="mt-8 space-y-6 text-slate-600">
                <p>{message}</p>
                {checkoutDetails?.customerEmail && (
                  <p className="text-sm font-semibold text-slate-700">
                    Sign in with {checkoutDetails.customerEmail}
                  </p>
                )}
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  Sign in
                </Link>
              </div>
            )}

            {status === STATUS.error && (
              <div className="mt-8 space-y-4 text-slate-600">
                <p>{message}</p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-400 hover:-translate-y-1 hover:shadow"
                >
                  Return home
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
