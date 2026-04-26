export type ArticleDefinition = {
  title: string;
  description: string;
  fileName: string;
};

export const ARTICLE_EMBEDS: Record<string, ArticleDefinition> = {
  "deutsche-sprache-geschichte": {
    title: "Geschichte der deutschen Sprache",
    description:
      "Wie Deutsch sich historisch entwickelt hat, welche Sprachstufen es gibt und was das für Lernende bedeutet.",
    fileName: "deutsche-sprache-geschichte.html",
  },
  "pruefungen-goethe-telc-testdaf": {
    title: "Prüfungen: Goethe / telc / TestDaF",
    description:
      "Vergleich der wichtigsten Prüfungen mit Fokus auf Formate, Niveaustruktur und Vorbereitungsschritte.",
    fileName: "pruefungen-goethe-telc-testdaf.html",
  },
  "sprachniveaus-a1-c1": {
    title: "Sprachniveaus A1-C1",
    description:
      "Praktische Orientierung, was du auf jedem Niveau erwarten kannst und wie du gezielt weiterkommst.",
    fileName: "sprachniveaus-a1-c1.html",
  },
};

export const ARTICLE_SLUGS = Object.keys(ARTICLE_EMBEDS);
