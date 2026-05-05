export const BOT_LOGO_PATH = "/logo/bot-logo.jpg";
export const CHANNEL_LOGO_PATH = "/logo/channel-logo.jpg";
export const WORKLOG_LOGO_PATH = "/products/worklog/logo.png";
export const WORKLOG_DOWNLOAD_PATH = "/downloads/worklog/direct-hoofdrapport.apk";

export const GLASS_CARD_CLASS =
  "rounded-3xl border border-white/10 bg-white/[0.07] shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09]";

export const ORANGE_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full bg-[#2AABEE] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(42,171,238,0.28)] transition hover:bg-[#169bdc]";

export const SECONDARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white transition hover:border-[#FFD166]/60 hover:bg-white/10";

export const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export const WISSEN_ARTICLES = [
  {
    slug: "deutsche-sprache-geschichte",
    category: "Sprachgeschichte",
    title: "Geschichte der deutschen Sprache",
    description:
      "Wie Deutsch entstanden ist, welche Sprachstufen wichtig sind und warum Sprache sich bis heute bewegt.",
  },
  {
    slug: "sprachniveaus-a1-c1",
    category: "Lernniveaus",
    title: "Sprachniveaus A1–C1: was bedeutet das?",
    description:
      "Eine klare Orientierung für Niveaus, Lernziele und den nächsten sinnvollen Schritt.",
  },
  {
    slug: "pruefungen-goethe-telc-testdaf",
    category: "Prüfung",
    title: "Prüfungen: Goethe / telc / TestDaF",
    description:
      "Die wichtigsten Prüfungsformate im Vergleich, mit Blick auf Struktur und Vorbereitung.",
  },
] as const;
