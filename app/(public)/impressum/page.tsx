import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressumsangaben für die öffentliche Quiz Arena Website.",
  alternates: {
    canonical: "/impressum",
  },
  openGraph: {
    title: "Impressum | Deutsch Quiz Arena",
    description: "Impressum und rechtliche Kontaktinformationen.",
    url: "/impressum",
  },
};

export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl">Impressum</h1>
      <section className="mt-4 space-y-4 text-sm text-slate-700">
        <article className="rounded-xl border border-white/70 bg-white/80 p-4">
          <p>Inhaber: Quiz Arena (placeholder)</p>
          <p>Kontakt: info@deutchquizarena.de</p>
          <p>Standort: Deutschland</p>
        </article>
      </section>
    </main>
  );
}
