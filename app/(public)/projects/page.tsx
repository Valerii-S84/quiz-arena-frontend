import type { Metadata } from "next";

import { PublicLegalFooter } from "../_components/public-legal-footer";
import { PUBLIC_SITE_NAME } from "@/lib/public-site-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projektübersicht",
  description:
    "Übersicht über die digitalen Deutsch-Lernangebote, Wissensinhalte und Werkzeuge von Deutsch ist einfach!.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: `Projektübersicht | ${PUBLIC_SITE_NAME}`,
    description:
      "Quiz-Bots, Wissensartikel und digitale Werkzeuge für erfolgreiches Deutschlernen.",
    url: "/projects",
  },
};

const projects = [
  {
    name: "Telegram Quiz Bot",
    description:
      "Tägliche Quizrunden, Duelle, Fortschritt und kurze Lernimpulse direkt in Telegram.",
  },
  {
    name: "Wissensartikel",
    description:
      "Redaktionelle Artikel für Orientierung, Sprachwissen und erste Einordnung rund um Deutschlernen.",
  },
  {
    name: "Digitale Lernwerkzeuge",
    description:
      "Praktische Werkzeuge für Wiederholung, Lernorganisation und kontinuierlichen Fortschritt.",
  },
];

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="text-4xl">Projektübersicht</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-ember/70">
        {PUBLIC_SITE_NAME} verbindet interaktive Quizformate, verständliche Wissensartikel und
        digitale Lernwerkzeuge. Wähle den Einstieg, der zu deinem Lernziel passt.
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
