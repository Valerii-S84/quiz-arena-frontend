export type ArticleDefinition = {
  title: string;
  breadcrumbLabel: string;
  category: string;
  description: string;
  fileName: string;
  lastModified: string;
  relatedSlugs: string[];
  source: "server-rendered";
  telegramStartPayload: string;
};

export const ARTICLE_EMBEDS: Record<string, ArticleDefinition> = {
  "deutsche-sprache-geschichte": {
    title: "Geschichte der deutschen Sprache",
    breadcrumbLabel: "Sprachgeschichte",
    category: "Sprachgeschichte",
    description:
      "Wie Deutsch sich historisch entwickelt hat, welche Sprachstufen es gibt und was das für Lernende bedeutet.",
    fileName: "deutsche-sprache-geschichte.html",
    lastModified: "2026-08-12",
    relatedSlugs: ["sprachniveaus-a0-c2", "pruefungen-goethe-telc-testdaf"],
    source: "server-rendered",
    telegramStartPayload: "site_article_sprachgeschichte",
  },
  "pruefungen-goethe-telc-testdaf": {
    title: "Prüfungen: Goethe / telc / TestDaF",
    breadcrumbLabel: "Deutschprüfungen",
    category: "Prüfungen",
    description:
      "Vergleich der wichtigsten Prüfungen mit Fokus auf Formate, Niveaustruktur und Vorbereitungsschritte.",
    fileName: "pruefungen-goethe-telc-testdaf.html",
    lastModified: "2026-08-13",
    relatedSlugs: ["sprachniveaus-a0-c2", "deutsche-sprache-geschichte"],
    source: "server-rendered",
    telegramStartPayload: "site_article_pruefungen",
  },
  "sprachniveaus-a0-c2": {
    title: "Sprachniveaus A0–C2",
    breadcrumbLabel: "Sprachniveaus",
    category: "Sprachniveaus",
    description:
      "Orientierung von Pre-A1 bis C2 mit GER-Kompetenzen, Lernzielen, Zeitkorridoren und passenden Deutschprüfungen.",
    fileName: "sprachniveaus-a0-c2.html",
    lastModified: "2026-08-13",
    relatedSlugs: ["pruefungen-goethe-telc-testdaf", "deutsche-sprache-geschichte"],
    source: "server-rendered",
    telegramStartPayload: "site_article_sprachniveaus",
  },
};

export const ARTICLE_SLUGS = Object.keys(ARTICLE_EMBEDS);
