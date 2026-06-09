import Link from "next/link";

const groups = [
  {
    title: "Learn",
    links: [
      { href: "/charity", label: "How it works" },
      { href: "/charity/claim", label: "Pricing" },
      { href: "/", label: "Why charities switch" },
    ],
  },
  {
    title: "Try it",
    links: [
      { href: "/upload", label: "Free file check" },
      { href: "/claims", label: "Claim workspace" },
      { href: "/dashboard", label: "Live dashboard" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "#", label: "Security" },
      { href: "#", label: "Data processing" },
      { href: "#", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-teal-900/10 bg-white/80">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 md:grid-cols-[1.2fr_2fr] md:px-10">
        <div>
          <p className="text-lg font-semibold text-slate-900">givta helps charities claim more with less admin</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
            Built for busy fundraising and finance teams who want a calm, clear way to recover Gift Aid and keep every step tidy.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{group.title}</p>
              <ul className="mt-3 grid gap-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-slate-700 transition hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
