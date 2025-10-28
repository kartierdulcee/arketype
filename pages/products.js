import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const products = [
  {
    title: "Launch Campaign Prompts",
    description: "All-in-one bundle for product launches with positioning, GTM emails, social captions, and ad variants.",
    price: "$59",
    priceId: "price_launchcampaign_placeholder",
    mode: "payment",
  },
  {
    title: "Customer Support Copilot",
    description: "Tone-aligned support macros, escalation summaries, and conversation sentiment checks tailored for CX teams.",
    price: "$49",
    priceId: "price_supportcopilot_placeholder",
    mode: "payment",
  },
  {
    title: "Product Discovery Sprints",
    description: "Prompts that turn raw feedback into actionable insights, sprint briefs, and usability study plans.",
    price: "$39",
    priceId: "price_productdiscovery_placeholder",
    mode: "payment",
  },
  {
    title: "Creator Monetization Pack",
    description: "Optimize content calendars, sponsorship pitches, and membership nurturing with proven prompt recipes.",
    price: "$69",
    priceId: "price_creatormonetization_placeholder",
    mode: "payment",
  },
];

export default function ProductsPage() {
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
      alert("We could not start checkout right now. Please try again shortly.");
    } finally {
      setLoadingPrice(null);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-white/70 pb-20 pt-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Prompt packs curated for every workflow
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Explore themed collections with ready-to-ship prompt frameworks. Each pack includes quickstart directions, remix suggestions, and usage tips.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {products.map((product) => (
              <ProductCard
                key={product.priceId}
                {...product}
                isLoading={loadingPrice === product.priceId}
                onPurchase={handleCheckout}
              />
            ))}
          </div>
          {loadingPrice && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Opening Stripe Checkout&hellip;
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
