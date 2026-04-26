import type { Metadata } from "next";

import {
  PublicHomeBotSection,
  PublicHomeChannelSection,
  PublicHomeContactSection,
  PublicHomeFooter,
  PublicHomeHeader,
  PublicHomeHero,
  PublicHomeKnowledgeSection,
  PublicHomeProductsSection,
} from "./public-home-sections";
import { buildTrackedTelegramBotUrl } from "./public-home-helpers";
import { fetchPublicHomeServerStats } from "./public-home-server-stats";
import { TELEGRAM_BOT_START_PAYLOAD, getTelegramBotUrl } from "@/lib/public-site-config";
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

export default async function PublicHomePage() {
  const telegramBotUrl = getTelegramBotUrl();
  const trackedTelegramBotUrl = buildTrackedTelegramBotUrl(
    telegramBotUrl,
    TELEGRAM_BOT_START_PAYLOAD,
  );

  const statsState = await fetchPublicHomeServerStats();

  return (
    <>
      <main
        id="public-home-root"
        className="min-h-screen bg-[linear-gradient(135deg,#d7ebf5_0%,#e4f1e0_50%,#f8ecd8_100%)] text-slate-900"
      >
        <PublicHomeHeader />

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
          <PublicHomeHero trackedTelegramBotUrl={trackedTelegramBotUrl} />
          <PublicHomeChannelSection />
          <PublicHomeBotSection
            trackedTelegramBotUrl={trackedTelegramBotUrl}
            stats={statsState}
          />
          <PublicHomeProductsSection />
          <PublicHomeContactSection />
          <PublicHomeKnowledgeSection />
          <PublicHomeFooter />
        </div>
      </main>

      <PublicHomeClient />
    </>
  );
}
