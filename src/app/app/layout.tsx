import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "@/auth";
import { AppNav } from "@/components/app/app-nav";
import { SignOutButton } from "@/components/app/sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        {/* Logo */}
        <div className="flex items-center border-b border-slate-200 px-5 py-4">
          <Link href="/app/dashboard">
            <Image src="/givta.svg" alt="givta" width={100} height={55} className="h-9 w-auto" priority />
          </Link>
        </div>

        {/* Navigation */}
        <AppNav />

        {/* User + sign out */}
        <div className="border-t border-slate-200 px-4 py-4">
          <p className="text-sm font-semibold text-slate-900">{session.user?.name ?? "Admin"}</p>
          <p className="mt-0.5 text-xs text-slate-500">{session.user?.email}</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
