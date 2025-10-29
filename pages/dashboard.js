import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { getSessionFromRequest } from "../lib/session";
import { getStripe } from "../lib/stripe";

export default function DashboardPage({ email }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    setSigningOut(true);
    setError("");

    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to sign out. Please try again.");
      }
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-white/70">
        <div className="mx-auto max-w-4xl px-6 py-16 md:px-10">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-soft">
            <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
            <p className="mt-2 text-slate-600">You are signed in as {email}.</p>
            <div className="mt-10 space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-slate-900">Membership</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Your Arketype subscription is active. We&apos;re building out the member hub—check
                  your inbox for updates and upcoming drops.
                </p>
              </section>
              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-400 hover:-translate-y-0.5 hover:shadow disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                >
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
                <Link
                  href="/"
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
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
