import type { Metadata } from "next";

import PublicHomeClient from "./public-home-client";

export const metadata: Metadata = {
  title: "Startseite",
  description:
    "Deutsch Quiz Arena für motiviertes Sprachlernen im Alltag: tägliche Quizze, Telegram-Insights und direkte Beratung.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Startseite | Deutsch Quiz Arena",
    description:
      "Deutsch lernen mit täglichen Quizzen, Lernstatistiken und personalisierten Lernwegen.",
    url: "/",
  },
};

export default function PublicHomePage() {
  return <PublicHomeClient />;
}
