import type { Metadata } from "next";

import { getPublicContactEmail } from "@/lib/public-site-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt für Deutsch Quiz Arena: Telegram-Channel, direkte E-Mail und rechtliche Links.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Kontakt | Deutsch Quiz Arena",
    description: "Kontakt und rechtliche Informationen für Nutzer der Plattform.",
    url: "/contact",
  },
};

const contactEmail = getPublicContactEmail();

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="text-4xl">Контакти</h1>
      <div className="mt-8 space-y-4">
        <a href="https://t.me/Deine_Deutsch_Quiz_bot" className="surface block rounded-2xl p-5">
          Telegram: @Deine_Deutsch_Quiz_bot
        </a>
        <a href={`mailto:${contactEmail}`} className="surface block rounded-2xl p-5">
          Email: {contactEmail}
        </a>
        <div className="grid gap-2 sm:grid-cols-2">
          <a href="/privacy" className="surface inline-flex rounded-full px-3 py-2 text-sm">
            Datenschutz
          </a>
          <a
            href="/impressum"
            className="surface inline-flex rounded-full px-3 py-2 text-sm"
          >
            Impressum
          </a>
        </div>
      </div>
    </main>
  );
}
