import Link from "next/link";
import type { Metadata } from "next";

import { PublicLegalFooter } from "../_components/public-legal-footer";
import { PublicSiteHeader } from "../_components/public-site-header";
import {
  PUBLIC_SITE_NAME,
  getPublicContactEmail,
  getTelegramBotUrl,
  getTelegramChannelUrl,
} from "@/lib/public-site-config";
import { ContactPageActions } from "./contact-page-actions";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt zu Deutsch-Lernangeboten, Lernbegleitung, Quiz-Bot und Kooperationen.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Kontakt | ${PUBLIC_SITE_NAME}`,
    description:
      "Direkter Kontakt für allgemeine Fragen sowie strukturierte Anfragen zu Lernbegleitung und Kooperationen.",
    url: "/contact",
  },
};

const contactEmail = getPublicContactEmail();
const telegramBotUrl = getTelegramBotUrl();
const telegramChannelUrl = getTelegramChannelUrl();

const contactTopics = [
  "Fragen zu Lernangeboten",
  "Quiz-Bot und Telegram-Kanal",
  "Technische Hinweise",
  "Datenschutz und Kooperationen",
] as const;

export default function ContactPage() {
  return (
    <>
      <PublicSiteHeader sectionLinkPrefix="/" />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(77,226,198,0.12),transparent_28%),linear-gradient(180deg,#020617_0%,#07111f_42%,#0b1220_100%)] text-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="transition hover:text-amber-200" href="/">
                  Startseite
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-600">
                ›
              </li>
              <li aria-current="page" className="font-medium text-slate-200">
                Kontakt
              </li>
            </ol>
          </nav>

          <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4DE2C6]">
                Direkter Kontakt
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
                Wie können wir dir helfen?
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {PUBLIC_SITE_NAME} – Schreib uns bei allgemeinen Fragen direkt per E-Mail oder
                nutze die passende Anfrage für Lernbegleitung und Kooperationen.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FFD166] px-5 py-2.5 text-sm font-semibold text-[#07111f] transition hover:bg-[#ffe099] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  E-Mail schreiben
                </a>
                <a
                  href={telegramChannelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#4DE2C6]/30 bg-[#4DE2C6]/10 px-5 py-2.5 text-sm font-semibold text-[#B9FFF2] transition hover:bg-[#4DE2C6]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9FFF2] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Telegram-Kanal öffnen
                </a>
              </div>
            </div>

            <aside className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Wobei wir weiterhelfen</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                {contactTopics.map((topic) => (
                  <li key={topic} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4DE2C6]" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <ContactPageActions />

          <section aria-labelledby="direct-contact-heading" className="mt-10">
            <div className="rounded-[28px] border border-white/10 bg-[#0b1726] p-5 sm:p-7">
              <h2 id="direct-contact-heading" className="text-2xl font-semibold text-white">
                Lieber direkt schreiben?
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Für allgemeine, technische oder datenschutzbezogene Anliegen brauchst du kein
                Formular. Wähle einfach den Kontaktweg, der für dich passt.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <a
                  href={`mailto:${contactEmail}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-amber-300/40 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
                    E-Mail
                  </span>
                  <span className="mt-2 block break-all text-sm font-medium text-white">
                    {contactEmail}
                  </span>
                </a>
                <a
                  href={telegramBotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-sky-300/40 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">
                    Quiz-Bot
                  </span>
                  <span className="mt-2 block text-sm font-medium text-white">In Telegram öffnen</span>
                </a>
                <a
                  href={telegramChannelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-emerald-300/40 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    Lernkanal
                  </span>
                  <span className="mt-2 block text-sm font-medium text-white">Zum Telegram-Kanal</span>
                </a>
              </div>
            </div>
          </section>

          <PublicLegalFooter variant="dark" />
        </div>
      </main>
    </>
  );
}
