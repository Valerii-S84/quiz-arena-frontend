import type { Metadata } from "next";

import { PublicLegalFooter } from "../_components/public-legal-footer";
import {
  PUBLIC_SITE_NAME,
  getPublicContactEmail,
  getTelegramBotUrl,
} from "@/lib/public-site-config";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressumsangaben für die öffentliche Website ${PUBLIC_SITE_NAME}.`,
  alternates: {
    canonical: "/impressum",
  },
  openGraph: {
    title: `Impressum | ${PUBLIC_SITE_NAME}`,
    description: "Impressum und rechtliche Kontaktinformationen.",
    url: "/impressum",
  },
};

export default function ImpressumPage() {
  const contactEmail = getPublicContactEmail();
  const telegramBotUrl = getTelegramBotUrl();

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-semibold text-slate-900">Impressum</h1>
      <section className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">Angaben gemaess § 5 DDG</h2>
          <div className="mt-3">
            <p className="font-medium text-slate-900">
              Verantwortlich für die Website {PUBLIC_SITE_NAME}:
            </p>
            <p>Valerii Serputko</p>
            <p className="mt-3 font-medium text-slate-900">Anschrift:</p>
            <p>Gudrunstrasse 134</p>
            <p>44319 Dortmund</p>
            <p>Deutschland</p>
          </div>
        </article>

        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">Kontakt</h2>
          <div className="mt-3 space-y-2">
            <p>
              E-Mail:{" "}
              <a className="underline underline-offset-2" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            </p>
            <p>
              Telegram:{" "}
              <a className="underline underline-offset-2" href={telegramBotUrl}>
                @Deine_Deutsch_Quiz_bot
              </a>
            </p>
          </div>
        </article>

        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">Hinweis zum Projektstatus</h2>
          <p className="mt-3">
            Diese Website ist eine Projekt- und Informationsseite im Aufbau. Eine gewerbliche
            Taetigkeit, verbindliche Buchung oder kostenpflichtige Leistung wird erst angeboten,
            wenn die dafuer erforderlichen Voraussetzungen geklaert und umgesetzt sind.
          </p>
        </article>

        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Verantwortlich fuer den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <div className="mt-3">
            <p>Valerii Serputko</p>
            <p>Gudrunstrasse 134</p>
            <p>44319 Dortmund</p>
            <p>Deutschland</p>
          </div>
          <p className="mt-3">
            Dieser Hinweis ist aufgenommen, weil auf der Website redaktionelle Artikelseiten
            bereitgestellt werden.
          </p>
        </article>
      </section>
      <PublicLegalFooter />
    </main>
  );
}
