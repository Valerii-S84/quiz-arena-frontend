import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Datenschutzhinweise zu Kontaktformular, Kontaktkanälen und möglichen Tracking-Hinweisen.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Datenschutz | Deutsch Quiz Arena",
    description: "Datenschutzhinweise zu Kontakt- und Nutzungsdaten in der öffentlichen Oberfläche.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl">Datenschutz</h1>
      <p className="mt-4 text-sm text-slate-700">
        Diese Seite beschreibt, welche Daten beim Kontakt über Formulare oder Telegram-Links verarbeitet
        werden und wie lange diese gespeichert werden.
      </p>
      <section className="mt-6 space-y-4 text-sm text-slate-700">
        <article className="rounded-xl border border-white/70 bg-white/80 p-4">
          <h2 className="font-semibold text-slate-900">Kontaktdaten</h2>
          <p className="mt-2">
            Wir verarbeiten Name, Kontaktweg und Angaben im Unterrichts- oder Partnerformular nur zur
            Bearbeitung deiner Anfrage.
          </p>
        </article>
        <article className="rounded-xl border border-white/70 bg-white/80 p-4">
          <h2 className="font-semibold text-slate-900">Tracking</h2>
          <p className="mt-2">
            Analyse- und Nutzungsmetriken werden nur für die Produktverbesserung verwendet.
          </p>
        </article>
      </section>
    </main>
  );
}
