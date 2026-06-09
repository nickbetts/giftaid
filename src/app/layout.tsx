import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const brandSans = Manrope({
  variable: "--font-brand-sans",
  subsets: ["latin"],
});

const brandDisplay = Newsreader({
  variable: "--font-brand-display",
  subsets: ["latin"],
});

const brandMono = IBM_Plex_Mono({
  variable: "--font-brand-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "givta",
  description:
    "givta helps charities recover more Gift Aid with less admin, plain-English guidance, and a simple 3% flat commission.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${brandSans.variable} ${brandDisplay.variable} ${brandMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
