export type ArticleDefinition = {
  title: string;
  description: string;
  fileName: string;
  source: "server-rendered";
};

export const ARTICLE_EMBEDS: Record<string, ArticleDefinition> = {
  "deutsche-sprache-geschichte": {
    title: "Geschichte der deutschen Sprache",
    description:
      "Wie Deutsch sich historisch entwickelt hat, welche Sprachstufen es gibt und was das für Lernende bedeutet.",
    fileName: "deutsche-sprache-geschichte.html",
    source: "server-rendered",
  },
  "pruefungen-goethe-telc-testdaf": {
    title: "Prüfungen: Goethe / telc / TestDaF",
    description:
      "Vergleich der wichtigsten Prüfungen mit Fokus auf Formate, Niveaustruktur und Vorbereitungsschritte.",
    fileName: "pruefungen-goethe-telc-testdaf.html",
    source: "server-rendered",
  },
  "sprachniveaus-a0-c2": {
    title: "Sprachniveaus A0–C2",
    description:
      "Orientierung von Pre-A1 bis C2 mit GER-Kompetenzen, Lernzielen, Zeitkorridoren und passenden Deutschprüfungen.",
    fileName: "sprachniveaus-a0-c2.html",
    source: "server-rendered",
  },
};

export const ARTICLE_SLUGS = Object.keys(ARTICLE_EMBEDS);
