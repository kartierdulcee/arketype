import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import PricingTier from "../components/PricingTier";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const pricingTiers = [
  {
    title: "Prompt Starter Pack",
    description: "Launch-ready prompts for marketing, product, and support workflows. Perfect for trying Arketype with one team.",
    price: "$49",
    billing: "one-time",
    features: ["20 expertly crafted prompts", "Prompt anatomy cheat sheet", "Lifetime access to updates"],
    priceId: "price_promptstarter_placeholder",
    mode: "payment",
  },
  {
    title: "Arketype Membership",
    description: "Unlimited access to new prompt drops, remix library, and team collaboration tools to scale AI adoption.",
    price: "$29",
    billing: "per month",
    features: ["Weekly prompt drops across industries", "Team workspace with shared collections", "Priority support and onboarding calls"],
    priceId: "price_promptmembership_placeholder",
    mode: "subscription",
    highlight: true,
  },
];

export default function HomePage() {
  const [loadingPrice, setLoadingPrice] = useState(null);

  const handleCheckout = useCallback(async (priceId, mode) => {
    setLoadingPrice(priceId);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to start checkout.");
      }

      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe failed to initialize.");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Checkout error", error);
      alert("We hit a snag starting checkout. Please try again or contact support.");
    } finally {
      setLoadingPrice(null);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <section id="pricing" className="bg-white/70">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Launch faster with prompt systems built for your teams
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Pick a starter pack or join the membership to unlock every new drop, template remix, and workflow tutorial.
              </p>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {pricingTiers.map((tier) => (
                <PricingTier
                  key={tier.priceId}
                  {...tier}
                  isLoading={loadingPrice === tier.priceId}
                  onSelect={handleCheckout}
                />
              ))}
            </div>
            {loadingPrice && (
              <p className="mt-6 text-center text-sm text-slate-500">
                Preparing your checkout experience&hellip;
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
