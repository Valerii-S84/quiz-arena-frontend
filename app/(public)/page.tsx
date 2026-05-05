import type { Metadata } from "next";

import {
  PublicHomeBotSection,
  PublicHomeContactSection,
  PublicHomeFooter,
  PublicHomeHeader,
  PublicHomeHero,
  PublicHomeKnowledgeSection,
  PublicHomeProductsSection,
  PublicHomeStatsSection,
} from "./public-home-sections";
import { buildTrackedTelegramBotUrl } from "./public-home-helpers";
import { fetchPublicHomeServerStats } from "./public-home-server-stats";
import { TELEGRAM_BOT_START_PAYLOAD, getTelegramBotUrl } from "@/lib/public-site-config";
import PublicHomeClient from "./public-home-client";

export const metadata: Metadata = {
  title: "Startseite",
  description:
    "Deutsch Quiz Arena als wachsendes Lern-Ökosystem mit Quiz-Bot, Unterricht, Telegram-Kanälen, IT-Quiz, Worklog und Wissen & Tipps.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Startseite | Deutsch Quiz Arena",
    description:
      "Deutsch lernen, Wissen testen und digitale Lernprodukte entdecken: Quiz-Bot, Unterricht, IT-Quiz, Worklog und Wissen & Tipps.",
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
        className="min-h-screen bg-[linear-gradient(135deg,#06111f_0%,#0b1726_48%,#13151d_100%)] text-white"
      >
        <PublicHomeHeader trackedTelegramBotUrl={trackedTelegramBotUrl} />

        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <PublicHomeHero trackedTelegramBotUrl={trackedTelegramBotUrl} />
          <PublicHomeStatsSection stats={statsState} />
          <PublicHomeBotSection trackedTelegramBotUrl={trackedTelegramBotUrl} />
          <PublicHomeProductsSection trackedTelegramBotUrl={trackedTelegramBotUrl} />
          <PublicHomeKnowledgeSection />
          <PublicHomeContactSection />
          <PublicHomeFooter trackedTelegramBotUrl={trackedTelegramBotUrl} />
        </div>
      </main>

      <PublicHomeClient />
    </>
  );
}
