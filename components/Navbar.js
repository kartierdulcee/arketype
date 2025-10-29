import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center space-x-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand font-semibold">
            AK
          </span>
          <span className="hidden text-lg font-semibold tracking-tight text-slate-900 sm:block">
            Arketype
          </span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors duration-200 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/products"
            className="rounded-full bg-slate-900 px-5 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Browse Prompts
          </Link>
        </div>
        <button
          aria-label="Toggle menu"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
        >
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </nav>
      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-6 pb-6 shadow-sm md:hidden">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-brand/5 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Browse Prompts
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
