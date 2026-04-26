"use client";

import { useState } from "react";
import { Inter } from "next/font/google";

import { ContactWizardModal } from "./_components/contact-wizards";
import { usePublicStats } from "./public-home-data";
import { buildTrackedTelegramBotUrl } from "./public-home-helpers";
import { TELEGRAM_BOT_START_PAYLOAD, getTelegramBotUrl } from "@/lib/public-site-config";
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
import type { ActiveWizard } from "./public-home-types";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function PublicHomeClient() {
  const stats = usePublicStats();
  const telegramBotUrl = getTelegramBotUrl();
  const [activeWizard, setActiveWizard] = useState<ActiveWizard>(null);

  const trackedTelegramBotUrl = buildTrackedTelegramBotUrl(
    telegramBotUrl,
    TELEGRAM_BOT_START_PAYLOAD,
  );

  return (
    <main
      lang="de"
      className={`${inter.className} min-h-screen bg-[linear-gradient(135deg,#d7ebf5_0%,#e4f1e0_50%,#f8ecd8_100%)] text-slate-900`}
    >
      <PublicHomeHeader />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        <PublicHomeHero trackedTelegramBotUrl={trackedTelegramBotUrl} />
        <PublicHomeChannelSection />
        <PublicHomeBotSection trackedTelegramBotUrl={trackedTelegramBotUrl} stats={stats} />
        <PublicHomeProductsSection />
        <PublicHomeContactSection
          onOpenStudentWizard={() => {
            setActiveWizard("student");
          }}
          onOpenPartnerWizard={() => {
            setActiveWizard("partner");
          }}
        />
        <PublicHomeKnowledgeSection />
        <PublicHomeFooter />
      </div>

      <ContactWizardModal
        kind="student"
        isOpen={activeWizard === "student"}
        onClose={() => setActiveWizard(null)}
      />
      <ContactWizardModal
        kind="partner"
        isOpen={activeWizard === "partner"}
        onClose={() => setActiveWizard(null)}
      />

      <style jsx global>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
      `}</style>
    </main>
  );
}
