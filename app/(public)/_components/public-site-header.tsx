"use client";

import Image from "next/image";
import Link from "next/link";

import { usePublicAnalytics } from "@/app/analytics-provider";
import {
  PUBLIC_SITE_LOGO_PATH,
  PUBLIC_SITE_NAME,
  TELEGRAM_BOT_START_PAYLOAD,
  getTelegramBotUrl,
} from "@/lib/public-site-config";
import { buildTrackedTelegramBotUrl } from "../public-home-helpers";

type PublicSiteHeaderProps = {
  sectionLinkPrefix?: "" | "/";
  trackedTelegramBotUrl?: string;
};

const publicNavigation = [
  { homeHref: "#projects", siteHref: "/#projects", label: "Projekte" },
  { homeHref: "#knowledge", siteHref: "/wissen", label: "Wissen & Tipps" },
  { homeHref: "#unterricht", siteHref: "/#unterricht", label: "Lernbegleitung" },
  { homeHref: "#contact", siteHref: "/#contact", label: "Kontakt" },
];

const LINK_FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD166] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]";

function getTrackedTelegramBotFallback(): string {
  return buildTrackedTelegramBotUrl(getTelegramBotUrl(), TELEGRAM_BOT_START_PAYLOAD);
}

export function PublicSiteHeader({
  sectionLinkPrefix = "",
  trackedTelegramBotUrl,
}: PublicSiteHeaderProps = {}) {
  const headerCtaUrl = trackedTelegramBotUrl ?? getTrackedTelegramBotFallback();
  const { trackEvent } = usePublicAnalytics();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07111f]/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className={`flex min-w-0 items-center gap-3 rounded-2xl ${LINK_FOCUS_CLASS}`}>
          <span
            aria-hidden="true"
            className="relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-2xl border border-[#F6C453]/60 bg-[linear-gradient(145deg,#FFFDF7_0%,#FFF8E7_52%,#FFF1C7_100%)] shadow-[0_12px_30px_rgba(246,196,83,0.18)] sm:h-16 sm:w-20"
          >
            <Image
              src={PUBLIC_SITE_LOGO_PATH}
              alt=""
              fill
              sizes="(min-width: 640px) 80px, 72px"
              className="object-contain p-1"
            />
          </span>
          <span className="min-w-0 text-base font-bold leading-tight text-white">
            {PUBLIC_SITE_NAME}
          </span>
        </Link>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <nav
            aria-label="Hauptnavigation"
            className="flex min-w-0 flex-wrap gap-1.5 text-sm text-slate-300 sm:gap-2"
          >
            {publicNavigation.map((item) => (
              <a
                key={item.homeHref}
                href={sectionLinkPrefix ? item.siteHref : item.homeHref}
                className={`rounded-full border border-transparent px-2.5 py-2 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white ${LINK_FOCUS_CLASS} sm:px-3`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href={headerCtaUrl}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#2AABEE] px-4 py-2 text-center text-sm font-semibold leading-snug text-white shadow-[0_12px_26px_rgba(42,171,238,0.28)] transition hover:bg-[#169bdc] ${LINK_FOCUS_CLASS} sm:w-auto`}
            onClick={() =>
              trackEvent("hero_cta_click", {
                section: "header",
                cta: "telegram_bot",
                destination: headerCtaUrl,
              })
            }
          >
            Quiz-Bot öffnen
          </a>
        </div>
      </div>
    </header>
  );
}
