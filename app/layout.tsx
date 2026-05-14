import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { getSiteUrl } from "@/lib/public-site-config";
import { Providers } from "./providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Deutsch Quiz Arena",
    template: "%s | Deutsch Quiz Arena",
  },
  description:
    "Deutsch lernen mit Telegram: tägliche Quizze, klare Lernpfade und Fortschrittsanalyse für Lernende und Teams.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Deutsch Quiz Arena",
    description:
      "Deutsch lernen mit Telegram: tägliche Quizze, klare Lernpfade und Fortschrittsanalyse für Lernende und Teams.",
    images: [
      {
        url: "/logo/bot-logo.jpg",
        width: 1200,
        height: 630,
        alt: "Deutsch Quiz Arena",
      },
    ],
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deutsch Quiz Arena",
    description:
      "Deutsch lernen mit täglichen Quizzen, Telegram-Bot und persönlicher Lernsteuerung.",
    images: ["/logo/bot-logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
