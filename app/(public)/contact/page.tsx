import type { Metadata } from "next";

import { PublicLegalFooter } from "../_components/public-legal-footer";
import {
  PUBLIC_SITE_NAME,
  getPublicContactEmail,
  getTelegramBotUrl,
  getTelegramChannelUrl,
} from "@/lib/public-site-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktseite für das Deutsch-Lernprojekt mit Quiz-Bot, technischen Anfragen und rechtlichen Informationen.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Kontakt | ${PUBLIC_SITE_NAME}`,
    description:
      "Kontakt zum Deutsch-Lernprojekt, zum Quiz-Bot sowie für technische, datenschutzbezogene und mögliche Kooperationsanfragen.",
    url: "/contact",
  },
};

const contactEmail = getPublicContactEmail();
const telegramBotUrl = getTelegramBotUrl();
const telegramChannelUrl = getTelegramChannelUrl();

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="text-4xl">Kontakt</h1>
      <div className="mt-8 space-y-6">
        <section className="surface rounded-2xl p-5">
          <p className="text-lg">
            Diese Seite ist der Kontaktpunkt für {PUBLIC_SITE_NAME} rund um den Quiz-Bot, den
            Telegram-Kanal und technische Rückfragen. Sie eignet sich auch für erste
            unverbindliche Nachrichten zu einer möglichen späteren Zusammenarbeit.
          </p>
          <p className="mt-4 text-sm">
            Status: Die Website ist derzeit im Aufbau. Verbindliche kostenpflichtige Leistungen
            werden aktuell nicht ueber diese Website verkauft oder gebucht.
          </p>
        </section>

        <section className="surface rounded-2xl p-5">
          <h2 className="text-2xl">Wofuer Sie uns kontaktieren koennen</h2>
          <ul className="mt-4 space-y-2">
            <li>Quiz-Bot</li>
            <li>Telegram-Kanal</li>
            <li>Technische Anfrage</li>
            <li>Moegliche Kooperation</li>
            <li>Datenschutz-Anfrage</li>
          </ul>
        </section>

        <a href={telegramBotUrl} className="surface block rounded-2xl p-5">
          Telegram: @Deine_Deutsch_Quiz_bot
        </a>
        <a href={telegramChannelUrl} className="surface block rounded-2xl p-5">
          Telegram-Kanal: deutsch ist einfach!
        </a>
        <a href={`mailto:${contactEmail}`} className="surface block rounded-2xl p-5">
          E-Mail: {contactEmail}
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

        <PublicLegalFooter />
      </div>
    </main>
  );
}
