import Link from "next/link";
import Navbar from "../components/Navbar";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
            🎉 Payment complete
          </span>
          <h1 className="mt-8 text-3xl font-semibold text-slate-900 sm:text-4xl">
            You are officially in the PromptShop crew
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            Check your inbox for a confirmation email and access instructions. We cannot wait to see what you build next.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              Explore More Prompts
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-400 hover:-translate-y-1 hover:shadow"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
