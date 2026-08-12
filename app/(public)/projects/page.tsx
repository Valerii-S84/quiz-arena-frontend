import type { Metadata } from "next";

import { PublicLegalFooter } from "../_components/public-legal-footer";
import { PUBLIC_SITE_NAME } from "@/lib/public-site-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projektübersicht",
  description:
    "Uebersicht ueber das Deutsch-Lernprojekt, Inhalte in Pilotphase und technische Formate in Vorbereitung.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: `Projektübersicht | ${PUBLIC_SITE_NAME}`,
    description:
      "Uebersicht ueber sichtbare Projektbausteine ohne verbindliches kommerzielles Angebot.",
    url: "/projects",
  },
};

const projects = [
  {
    name: "Telegram Quiz Bot",
    description:
      "Pilotphase fuer taegliche Quizrunden, Fortschritt und kurze Lernimpulse direkt in Telegram.",
  },
  {
    name: "Wissensartikel",
    description:
      "Redaktionelle Artikel fuer Orientierung, Sprachwissen und erste Einordnung rund um Deutschlernen.",
  },
  {
    name: "Weitere Formate in Vorbereitung",
    description:
      "Zusaetzliche Lern- und Tool-Ideen werden geprueft, befinden sich aber noch nicht in einem verbindlichen Angebot.",
  },
];

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="text-4xl">Projektuebersicht</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-ember/70">
        Diese Seite zeigt den aktuellen Stand von {PUBLIC_SITE_NAME}. Sie dient der Orientierung
        und stellt noch keinen Online-Shop, keine Buchungsplattform und kein verbindliches
        Leistungsangebot dar.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {projects.map((project) => (
          <article key={project.name} className="surface rounded-2xl p-5">
            <h2 className="text-xl">{project.name}</h2>
            <p className="mt-2 text-sm text-ember/70">{project.description}</p>
          </article>
        ))}
      </div>
      <PublicLegalFooter />
    </main>
  );
}
