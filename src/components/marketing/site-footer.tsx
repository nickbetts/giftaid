import Link from "next/link";

const groups = [
  {
    title: "Charities",
    links: [
      { href: "/charity", label: "How it works" },
      { href: "/charity/claim", label: "Claim submissions" },
      { href: "/dashboard", label: "Dashboard preview" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/upload", label: "Upload preflight" },
      { href: "/claims", label: "Claim command center" },
      { href: "/", label: "Home" },
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
          <p className="text-lg font-semibold text-slate-900">Helping charities recover every eligible pound</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
            GiftAid OS is being built for finance and fundraising teams who want a simpler way to submit claims and stay
            fully compliant.
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
