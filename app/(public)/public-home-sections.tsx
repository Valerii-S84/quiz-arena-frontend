import Image from "next/image";
import Link from "next/link";

import {
  PUBLIC_SITE_NAME,
  QUIZ_PRODUCT_NAME,
  TELEGRAM_BOT_START_PAYLOAD,
  getDeutschTrainerBotUrl,
  getTelegramBotUrl,
  getTelegramChannelUrl,
} from "@/lib/public-site-config";

import {
  BOT_LOGO_PATH,
  CHANNEL_LOGO_PATH,
  DEUTSCH_TRAINER_LOGO_PATH,
  GLASS_CARD_CLASS,
  ORANGE_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  WISSEN_ARTICLES,
  WORKLOG_INFO_PATH,
  WORKLOG_LOGO_PATH,
} from "./public-home-content";
import { PublicHomeQuizTeaserWidget } from "./_components/quiz-teaser-widget";
import { buildTrackedTelegramBotUrl, formatStatValue } from "./public-home-helpers";
import type { StatsState } from "./public-home-types";

type PublicHomeHeroProps = {
  trackedTelegramBotUrl: string;
};

type PublicHomeStatsSectionProps = {
  stats: StatsState;
};

type PublicHomeBotSectionProps = {
  trackedTelegramBotUrl: string;
};

type PublicHomeQuizTeaserSectionProps = {
  trackedTelegramBotUrl: string;
};

type PublicHomeProductsSectionProps = {
  trackedTelegramBotUrl?: string;
};

type PublicHomeContactSectionProps = {
  onOpenStudentWizard?: () => void;
  onOpenPartnerWizard?: () => void;
};

type PublicHomeFooterProps = {
  trackedTelegramBotUrl?: string;
};

type ProductCard = {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  actionLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  accentClass: string;
  download?: string;
  analyticsEventName?: "hero_cta_click" | "channel_cta_click";
  analyticsSection?: string;
  analyticsCta?: string;
};

const LINK_FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD166] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]";

const botFeatures = [
  {
    title: "Daily Challenge",
    description: "Ein fester Tagesimpuls für kurze, konzentrierte Quizrunden.",
  },
  {
    title: "Duelle",
    description: "Direkter Vergleich mit Freunden und anderen Lernenden in der Arena.",
  },
  {
    title: "Fortschritt",
    description: "Klare Rückmeldung zu richtigen Antworten, Serien und Entwicklung.",
  },
  {
    title: "Fehlertraining",
    description: "Schwierige Fragen gezielt wiederholen und Wissen dauerhaft festigen.",
  },
];

function getTrackedTelegramBotFallback(): string {
  return buildTrackedTelegramBotUrl(getTelegramBotUrl(), TELEGRAM_BOT_START_PAYLOAD);
}

function opensInNewTab(href: string, download?: string): boolean {
  if (download) {
    return false;
  }

  return href.startsWith("http://") || href.startsWith("https://");
}

function getProjectCards(trackedTelegramBotUrl: string): ProductCard[] {
  return [
    {
      title: QUIZ_PRODUCT_NAME,
      eyebrow: "Telegram Quiz Bot",
      description: "Tägliche Quizrunden, Duelle, Streaks und Fortschritt direkt in Telegram.",
      href: trackedTelegramBotUrl,
      actionLabel: "Bot öffnen",
      imageSrc: BOT_LOGO_PATH,
      imageAlt: `${QUIZ_PRODUCT_NAME} Logo`,
      accentClass: "from-[#2AABEE]/20 to-[#FFD166]/10",
      analyticsEventName: "hero_cta_click",
      analyticsSection: "product_card",
      analyticsCta: "telegram_bot",
    },
    {
      title: "Deutsch ist einfach!",
      eyebrow: "Telegram-Kanal",
      description: "Kurze Lernposts, Redemittel, Mini-Übungen und Impulse für den Alltag.",
      href: getTelegramChannelUrl(),
      actionLabel: "Kanal öffnen",
      imageSrc: CHANNEL_LOGO_PATH,
      imageAlt: "Deutsch ist einfach! Kanal Logo",
      accentClass: "from-[#4DE2C6]/20 to-[#2AABEE]/10",
      analyticsEventName: "channel_cta_click",
      analyticsSection: "product_card",
      analyticsCta: "telegram_channel",
    },
    {
      title: "Deutsch Trainer Bot",
      eyebrow: "Persönliches Training",
      description:
        "Kurze Deutsch-Quizsessions mit Fortschritt, Wiederholungen und direktem Feedback.",
      href: getDeutschTrainerBotUrl(),
      actionLabel: "Trainer öffnen",
      imageSrc: DEUTSCH_TRAINER_LOGO_PATH,
      imageAlt: "Deutsch Trainer Bot Logo",
      accentClass: "from-[#FFD166]/20 to-[#4DE2C6]/10",
      analyticsEventName: "hero_cta_click",
      analyticsSection: "product_card",
      analyticsCta: "telegram_bot",
    },
    {
      title: "Worklog",
      eyebrow: "Organisation",
      description:
        "Aufgaben, Notizen und Arbeitsabläufe übersichtlich an einem Ort organisieren.",
      href: WORKLOG_INFO_PATH,
      actionLabel: "Mehr erfahren",
      imageSrc: WORKLOG_LOGO_PATH,
      imageAlt: "Worklog Logo",
      accentClass: "from-white/20 to-[#2AABEE]/10",
    },
  ];
}

function ProductIcon({ product }: { product: ProductCard }) {
  if (product.imageSrc && product.imageAlt) {
    return (
      <span
        aria-hidden="true"
        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:h-11 sm:w-11"
      >
        <Image
          src={product.imageSrc}
          alt=""
          fill
          sizes="44px"
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#FFD166]/30 bg-[#FFD166]/10 text-sm font-bold text-[#FFD166] sm:h-11 sm:w-11"
    >
      {product.title.slice(0, 2).toUpperCase()}
    </span>
  );
}

function SmallProductCard({ product }: { product: ProductCard }) {
  const shouldOpenInNewTab = opensInNewTab(product.href, product.download);

  return (
    <a
      href={product.href}
      target={shouldOpenInNewTab ? "_blank" : undefined}
      rel={shouldOpenInNewTab ? "noreferrer" : undefined}
      download={product.download}
      aria-label={`${product.title}: ${product.actionLabel}`}
      data-analytics-event={product.analyticsEventName}
      data-analytics-section={product.analyticsSection}
      data-analytics-cta={product.analyticsCta}
      className={`group block min-w-0 rounded-2xl border border-white/10 bg-gradient-to-br ${product.accentClass} p-3 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] ${LINK_FOCUS_CLASS} sm:p-4`}
    >
      <div className="flex items-start gap-3">
        <ProductIcon product={product} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-slate-400">{product.eyebrow}</p>
          <h3 className="mt-1 break-words text-base font-semibold leading-snug text-white">
            {product.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-300">
            {product.description}
          </p>
        </div>
      </div>
    </a>
  );
}

function ProjectCard({ product }: { product: ProductCard }) {
  const shouldOpenInNewTab = opensInNewTab(product.href, product.download);

  return (
    <article className={`${GLASS_CARD_CLASS} flex h-full min-w-0 flex-col p-4 sm:p-6`}>
      <div className="flex items-start gap-4">
        <ProductIcon product={product} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-slate-400">{product.eyebrow}</p>
          <h3 className="mt-2 break-words text-lg font-semibold leading-tight text-white sm:text-xl">
            {product.title}
          </h3>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{product.description}</p>
      <a
        href={product.href}
        target={shouldOpenInNewTab ? "_blank" : undefined}
        rel={shouldOpenInNewTab ? "noreferrer" : undefined}
        download={product.download}
        aria-label={`${product.actionLabel}: ${product.title}`}
        data-analytics-event={product.analyticsEventName}
        data-analytics-section={product.analyticsSection}
        data-analytics-cta={product.analyticsCta}
        className={`mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-center text-sm font-semibold leading-snug text-white transition hover:border-[#2AABEE]/70 hover:bg-[#2AABEE]/20 ${LINK_FOCUS_CLASS} sm:w-fit`}
      >
        {product.actionLabel}
      </a>
    </article>
  );
}

export function PublicHomeHero({ trackedTelegramBotUrl }: PublicHomeHeroProps) {
  const liveProducts = getProjectCards(trackedTelegramBotUrl);

  return (
    <section
      id="hero"
      className="grid min-w-0 gap-6 py-8 sm:gap-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-20"
    >
      <div className="flex min-w-0 flex-col justify-center">
        <p className="inline-flex max-w-full rounded-full border border-[#4DE2C6]/25 bg-[#4DE2C6]/10 px-3 py-1 text-xs font-semibold uppercase leading-snug text-[#4DE2C6]">
          Deutsch lernen mit System
        </p>
        <h1 className="mt-5 max-w-4xl break-words text-[2rem] font-semibold leading-[1.08] text-white sm:text-5xl sm:leading-tight lg:text-6xl">
          Deutsch lernen. Wissen testen. Jeden Tag Fortschritte machen.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
          {PUBLIC_SITE_NAME} bündelt Wissensartikel, Lernimpulse, Telegram-Angebote und digitale
          Formate. {QUIZ_PRODUCT_NAME} ist das Quiz-Produkt der Marke.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={trackedTelegramBotUrl}
            target="_blank"
            rel="noreferrer"
            className={`w-full sm:w-auto ${ORANGE_BUTTON_CLASS}`}
            data-analytics-event="hero_cta_click"
            data-analytics-section="hero"
            data-analytics-cta="telegram_bot"
          >
            Quiz-Bot öffnen
          </a>
          <a
            href="#projects"
            className={`w-full sm:w-auto ${SECONDARY_BUTTON_CLASS}`}
            data-analytics-event="hero_cta_click"
            data-analytics-section="hero"
            data-analytics-cta="projects_anchor"
          >
            Alle Angebote entdecken
          </a>
        </div>
      </div>

      <aside className={`${GLASS_CARD_CLASS} min-w-0 p-4 sm:p-6`} aria-label="Lernangebote">
        <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#FFD166]">Alles an einem Ort</p>
            <h2 className="mt-1 break-words text-xl font-semibold text-white sm:text-2xl">
              Wähle dein Lernformat.
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-[#4DE2C6]/30 bg-[#4DE2C6]/10 px-3 py-1 text-xs font-semibold text-[#4DE2C6]">
            Direkt starten
          </span>
        </div>
        <div className="mt-5 grid gap-3">
          {liveProducts.map((product) => (
            <SmallProductCard key={product.title} product={product} />
          ))}
        </div>
      </aside>
    </section>
  );
}

export function PublicHomeStatsSection({ stats }: PublicHomeStatsSectionProps) {
  const metricCards = [
    { label: "Nutzer", value: formatStatValue(stats.users) },
    { label: "Gespielte Quizze", value: formatStatValue(stats.quizzes) },
  ];

  return (
    <section id="stats" className="scroll-mt-24 py-5 sm:py-6">
      <div className={`${GLASS_CARD_CLASS} min-w-0 p-4 sm:p-6`}>
        <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#FFD166]">Community in Zahlen</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Gemeinsam Deutsch lernen
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Aktuelle Zahlen aus Quizrunden und der wachsenden Lerngemeinschaft.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {metricCards.map((metric) => (
              <article
                key={metric.label}
                className="min-w-0 rounded-2xl border border-white/10 bg-[#0b1726] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:p-5"
              >
                <p className="text-sm font-semibold text-slate-400">{metric.label}</p>
                <p className="mt-2 break-words text-3xl font-semibold text-white sm:text-4xl">
                  {metric.value}
                </p>
                {stats.isUnavailable ? (
                  <p className="mt-2 text-xs text-slate-500">vorübergehend nicht verfügbar</p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PublicHomeQuizTeaserSection({
  trackedTelegramBotUrl,
}: PublicHomeQuizTeaserSectionProps) {
  return (
    <section id="quiz-teaser" className="scroll-mt-24 py-7 sm:py-8">
      <div
        className={`${GLASS_CARD_CLASS} grid min-w-0 gap-5 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.75fr)] lg:items-center`}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#FFD166]">Interaktiver Test</p>
          <h2 className="mt-2 max-w-2xl break-words text-2xl font-semibold leading-tight text-white sm:text-4xl">
            Teste dein Deutsch in 5 Fragen.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:leading-8">
            Beantworte fünf kurze Quizfragen und sieh sofort, wie gut du abschneidest. Danach
            kannst du im Telegram-Bot mit Daily Challenge, Duellen und Fortschritt weitermachen.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-3 sm:gap-3">
            {["Sofortiges Feedback", "Nur 5 Fragen", "Weiter im Bot"].map((item) => (
              <div
                key={item}
                className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold leading-snug text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <PublicHomeQuizTeaserWidget trackedTelegramBotUrl={trackedTelegramBotUrl} />
      </div>
    </section>
  );
}

export function PublicHomeChannelSection() {
  const telegramChannelUrl = getTelegramChannelUrl();

  return (
    <section id="channel" className="scroll-mt-24 py-6">
      <div
        className={`${GLASS_CARD_CLASS} flex min-w-0 flex-col gap-5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6`}
      >
        <div className="flex min-w-0 items-start gap-4">
          <ProductIcon
            product={{
              title: "Deutsch ist einfach!",
              eyebrow: "Telegram-Kanal",
              description: "",
              href: telegramChannelUrl,
              actionLabel: "Kanal öffnen",
              imageSrc: CHANNEL_LOGO_PATH,
              imageAlt: "Deutsch ist einfach! Kanal Logo",
              accentClass: "",
            }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#4DE2C6]">Telegram-Kanal</p>
            <h3 className="mt-1 break-words text-lg font-semibold text-white sm:text-xl">
              Deutsch ist einfach!
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Kurze Lernposts, Mini-Übungen, Dialoge und alltagstaugliche Redemittel.
            </p>
          </div>
        </div>
        <a
          href={telegramChannelUrl}
          target="_blank"
          rel="noreferrer"
          className={`w-full sm:w-auto ${ORANGE_BUTTON_CLASS}`}
          data-analytics-event="channel_cta_click"
          data-analytics-section="channel"
          data-analytics-cta="telegram_channel"
        >
          Kanal öffnen
        </a>
      </div>
    </section>
  );
}

export function PublicHomeBotSection({ trackedTelegramBotUrl }: PublicHomeBotSectionProps) {
  return (
    <section id="bot" className="scroll-mt-24 py-8 sm:py-10">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#4DE2C6]">{QUIZ_PRODUCT_NAME}</p>
          <h2 className="mt-2 max-w-2xl break-words text-2xl font-semibold leading-tight text-white sm:text-4xl">
            Dein täglicher Trainingsraum für Deutsch.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:leading-8">
            Kurze Quizrunden, Daily Challenge, Streaks, Duelle und klare Rückmeldung — direkt in
            Telegram, ohne extra App.
          </p>
          <a
            href={trackedTelegramBotUrl}
            target="_blank"
            rel="noreferrer"
            className={`mt-7 w-full sm:w-auto ${ORANGE_BUTTON_CLASS}`}
            data-analytics-event="hero_cta_click"
            data-analytics-section="bot_block"
            data-analytics-cta="telegram_bot"
          >
            Quiz-Bot öffnen
          </a>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {botFeatures.map((feature) => (
            <article key={feature.title} className={`${GLASS_CARD_CLASS} min-w-0 p-4 sm:p-5`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#2AABEE]/30 bg-[#2AABEE]/10 text-sm font-bold text-[#2AABEE]">
                {feature.title.slice(0, 2)}
              </div>
              <h3 className="mt-4 break-words text-lg font-semibold text-white sm:text-xl">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicHomeProductsSection({
  trackedTelegramBotUrl,
}: PublicHomeProductsSectionProps = {}) {
  const productCards = getProjectCards(trackedTelegramBotUrl ?? getTrackedTelegramBotFallback());

  return (
    <section id="projects" className="scroll-mt-24 py-8 sm:py-10">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#FFD166]">Lernangebote</p>
          <h2 className="mt-2 break-words text-2xl font-semibold text-white sm:text-4xl">
            Wähle das Format, das zu dir passt
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-300">
          Quiz-Bots, Lernimpulse, Wissensartikel und digitale Werkzeuge für deinen Alltag.
        </p>
      </div>
      <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productCards.map((product) => (
          <ProjectCard key={product.title} product={product} />
        ))}
      </div>
    </section>
  );
}

export function PublicHomeKnowledgeSection() {
  return (
    <section id="knowledge" className="scroll-mt-24 py-8 sm:py-10">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#4DE2C6]">Wissen & Tipps</p>
          <h2 className="mt-2 break-words text-2xl font-semibold text-white sm:text-4xl">
            Wissen & Tipps
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-slate-300">
          Lesestoff für Orientierung und ein besseres Gefühl für Sprache.
        </p>
      </div>
      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-3">
        {WISSEN_ARTICLES.map((article) => (
          <article
            key={article.slug}
            className={`${GLASS_CARD_CLASS} flex h-full min-w-0 flex-col p-4 sm:p-6`}
          >
            <p className="text-sm font-semibold text-[#FFD166]">{article.category}</p>
            <h3 className="mt-3 break-words text-lg font-semibold leading-tight text-white sm:text-xl">
              {article.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{article.description}</p>
            <Link
              href={`/artikel/${article.slug}`}
              aria-label={`Artikel lesen: ${article.title}`}
              className={`mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#FFD166]/70 hover:bg-[#FFD166]/10 ${LINK_FOCUS_CLASS} sm:w-fit`}
            >
              Lesen
            </Link>
          </article>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Link
          href="/wissen"
          className={`inline-flex min-h-11 items-center justify-center rounded-full border border-[#4DE2C6]/30 bg-[#4DE2C6]/10 px-5 py-2.5 text-sm font-semibold text-[#B9FFF2] transition hover:bg-[#4DE2C6]/20 ${LINK_FOCUS_CLASS}`}
        >
          Alle Artikel entdecken
        </Link>
      </div>
    </section>
  );
}

export function PublicHomeContactSection({
  onOpenStudentWizard,
  onOpenPartnerWizard,
}: PublicHomeContactSectionProps = {}) {
  return (
    <>
      <section id="unterricht" className="scroll-mt-24 py-8 sm:py-10">
        <div
          className={`${GLASS_CARD_CLASS} grid min-w-0 gap-5 p-4 sm:gap-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center`}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#FFD166]">Lernbegleitung</p>
            <h2 className="mt-2 max-w-3xl break-words text-2xl font-semibold leading-tight text-white sm:text-4xl">
              Finde die Lernbegleitung, die zu deinen Zielen passt.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:leading-8">
              Ob Alltag, Beruf oder Prüfung: Teile uns dein Deutschniveau, deine Ziele und deinen
              Zeitplan mit. So können wir die passende Lernform für dich finden.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenStudentWizard}
            data-wizard="student"
            className={`w-full sm:w-auto ${ORANGE_BUTTON_CLASS}`}
          >
            Lernbegleitung anfragen
          </button>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 py-8 sm:py-10">
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch">
          <article className={`${GLASS_CARD_CLASS} min-w-0 p-4 sm:p-8`}>
            <p className="text-sm font-semibold text-[#4DE2C6]">Kooperationen</p>
            <h2 className="mt-2 break-words text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Gemeinsam mehr Menschen für Deutsch begeistern.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:leading-8">
              Wir arbeiten mit Kanälen, Lehrkräften, Schulen und Lerncommunities an Formaten, die
              Deutschlernen zugänglich, motivierend und wirksam machen.
            </p>
            <button
              type="button"
              onClick={onOpenPartnerWizard}
              data-wizard="partner"
              className={`mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#4DE2C6]/30 bg-[#4DE2C6]/10 px-5 py-2.5 text-center text-sm font-semibold leading-snug text-[#B9FFF2] transition hover:bg-[#4DE2C6]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9FFF2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f] sm:w-auto`}
            >
              Kooperation anfragen
            </button>
          </article>

          <div className="grid min-w-0 gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {["Kanäle", "Lehrkräfte", "Schulen & Communities"].map((item) => (
              <article key={item} className="min-w-0 rounded-2xl border border-white/10 bg-[#0b1726] p-4 sm:rounded-3xl sm:p-5">
                <h3 className="break-words text-lg font-semibold text-white">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Gemeinsam entwickeln wir ein klares Ziel, das passende Format und einen
                  realistischen Zeitplan.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function PublicHomeFooter({ trackedTelegramBotUrl }: PublicHomeFooterProps = {}) {
  const telegramUrl = trackedTelegramBotUrl ?? getTrackedTelegramBotFallback();

  return (
    <footer className="mt-6 border-t border-white/10 py-7 text-sm text-slate-400 sm:mt-8 sm:py-8">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 {PUBLIC_SITE_NAME}</p>
        <nav aria-label="Footer" className="flex min-w-0 flex-wrap gap-3">
          <Link href="/impressum" className={`transition hover:text-white ${LINK_FOCUS_CLASS}`}>
            Impressum
          </Link>
          <Link href="/privacy" className={`transition hover:text-white ${LINK_FOCUS_CLASS}`}>
            Datenschutz
          </Link>
          <Link href="/contact" className={`transition hover:text-white ${LINK_FOCUS_CLASS}`}>
            Kontakt
          </Link>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            className={`transition hover:text-white ${LINK_FOCUS_CLASS}`}
          >
            Telegram
          </a>
        </nav>
      </div>
    </footer>
  );
}
