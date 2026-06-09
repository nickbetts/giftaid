import { GivtaLogo } from "@/components/givta-logo";
import Link from "next/link";

const links = [
  { href: "/charity", label: "How it works" },
  { href: "/charity/claim", label: "Pricing" },
  { href: "/upload", label: "Free file check" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-teal-900/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-3 md:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <GivtaLogo height={36} className="w-auto" />
          <span className="hidden text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase xl:block">Gift Aid made simple</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:text-brand"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Start with givta
          </Link>
        </div>
      </div>
    </header>
  );
}
