export type ArticleDefinition = {
  title: string;
  breadcrumbLabel: string;
  category: string;
  description: string;
  fileName: string;
  relatedSlugs: string[];
  source: "server-rendered";
};

export const ARTICLE_EMBEDS: Record<string, ArticleDefinition> = {
  "deutsche-sprache-geschichte": {
    title: "Geschichte der deutschen Sprache",
    breadcrumbLabel: "Sprachgeschichte",
    category: "Sprachgeschichte",
    description:
      "Wie Deutsch sich historisch entwickelt hat, welche Sprachstufen es gibt und was das für Lernende bedeutet.",
    fileName: "deutsche-sprache-geschichte.html",
    relatedSlugs: ["sprachniveaus-a0-c2", "pruefungen-goethe-telc-testdaf"],
    source: "server-rendered",
  },
  "pruefungen-goethe-telc-testdaf": {
    title: "Prüfungen: Goethe / telc / TestDaF",
    breadcrumbLabel: "Deutschprüfungen",
    category: "Prüfungen",
    description:
      "Vergleich der wichtigsten Prüfungen mit Fokus auf Formate, Niveaustruktur und Vorbereitungsschritte.",
    fileName: "pruefungen-goethe-telc-testdaf.html",
    relatedSlugs: ["sprachniveaus-a0-c2", "deutsche-sprache-geschichte"],
    source: "server-rendered",
  },
  "sprachniveaus-a0-c2": {
    title: "Sprachniveaus A0–C2",
    breadcrumbLabel: "Sprachniveaus",
    category: "Sprachniveaus",
    description:
      "Orientierung von Pre-A1 bis C2 mit GER-Kompetenzen, Lernzielen, Zeitkorridoren und passenden Deutschprüfungen.",
    fileName: "sprachniveaus-a0-c2.html",
    relatedSlugs: ["pruefungen-goethe-telc-testdaf", "deutsche-sprache-geschichte"],
    source: "server-rendered",
  },
};

export const ARTICLE_SLUGS = Object.keys(ARTICLE_EMBEDS);
