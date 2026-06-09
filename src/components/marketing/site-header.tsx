import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/charity", label: "How it works" },
  { href: "/charity/claim", label: "Pricing" },
  { href: "/upload", label: "Free file check" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-teal-900/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/givta.svg" alt="givta" width={140} height={76} className="h-12 w-auto" priority />
          <span className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">Gift Aid made simple</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-700 transition hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/charity"
          className="rounded-full border border-brand/40 bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          Start with givta
        </Link>
      </div>
    </header>
  );
}
