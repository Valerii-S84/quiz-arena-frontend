import Image from "next/image";
import Link from "next/link";

import {
  TELEGRAM_BOT_START_PAYLOAD,
  getItQuizBotUrl,
  getTelegramBotUrl,
  getTelegramChannelUrl,
} from "@/lib/public-site-config";

import {
  BOT_LOGO_PATH,
  CHANNEL_LOGO_PATH,
  GLASS_CARD_CLASS,
  ORANGE_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  WISSEN_ARTICLES,
  WORKLOG_DOWNLOAD_PATH,
  WORKLOG_LOGO_PATH,
} from "./public-home-content";
import { PublicHomeQuizTeaserWidget } from "./_components/quiz-teaser-widget";
import { buildTrackedTelegramBotUrl, formatStatValue } from "./public-home-helpers";
import type { StatsState } from "./public-home-types";

type PublicHomeHeaderProps = {
  trackedTelegramBotUrl?: string;
};

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
};

const publicNavigation = [
  { href: "#projects", label: "Projekte" },
  { href: "#knowledge", label: "Wissen & Tipps" },
  { href: "#unterricht", label: "Unterricht" },
  { href: "#contact", label: "Kontakt" },
];

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
    title: "Premium",
    description: "Mehr Trainingsmöglichkeiten für Lernende, die tiefer einsteigen wollen.",
  },
];

function getTrackedTelegramBotFallback(): string {
  return buildTrackedTelegramBotUrl(getTelegramBotUrl(), TELEGRAM_BOT_START_PAYLOAD);
}

function getProjectCards(trackedTelegramBotUrl: string): ProductCard[] {
  return [
    {
      title: "Deutsch Quiz Arena Bot",
      eyebrow: "Telegram Bot",
      description: "Tägliche Quizrunden, Duelle, Streaks und Fortschritt direkt in Telegram.",
      href: trackedTelegramBotUrl,
      actionLabel: "Bot starten",
      imageSrc: BOT_LOGO_PATH,
      imageAlt: "Deutsch Quiz Arena Bot Logo",
      accentClass: "from-[#2AABEE]/20 to-[#FFD166]/10",
    },
    {
      title: "Deutsch ist einfach! Schule",
      eyebrow: "Telegram-Kanal",
      description: "Kurze Lernposts, Redemittel, Mini-Übungen und Impulse für den Alltag.",
      href: getTelegramChannelUrl(),
      actionLabel: "Kanal öffnen",
      imageSrc: CHANNEL_LOGO_PATH,
      imageAlt: "Deutsch ist einfach! Schule Logo",
      accentClass: "from-[#4DE2C6]/20 to-[#2AABEE]/10",
    },
    {
      title: "IT Quiz Bot",
      eyebrow: "IT Training",
      description: "Technisches Wissen in kurzen Quizformaten testen und schrittweise ausbauen.",
      href: getItQuizBotUrl(),
      actionLabel: "IT-Quiz öffnen",
      accentClass: "from-[#FFD166]/20 to-[#4DE2C6]/10",
    },
    {
      title: "Worklog APK",
      eyebrow: "Produkt-Lab",
      description:
        "Das erste eigene Produkt aus unserem Produkt-Lab — ein einfaches Tool für Arbeit, Notizen und Organisation.",
      href: WORKLOG_DOWNLOAD_PATH,
      actionLabel: "APK herunterladen",
      imageSrc: WORKLOG_LOGO_PATH,
      imageAlt: "Worklog Logo",
      accentClass: "from-white/20 to-[#2AABEE]/10",
      download: "worklog-direct-hoofdrapport.apk",
    },
  ];
}

function ProductIcon({ product }: { product: ProductCard }) {
  if (product.imageSrc && product.imageAlt) {
    return (
      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:h-11 sm:w-11">
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes="44px"
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#FFD166]/30 bg-[#FFD166]/10 text-sm font-bold text-[#FFD166] sm:h-11 sm:w-11">
      IT
    </span>
  );
}

function SmallProductCard({ product }: { product: ProductCard }) {
  return (
    <a
      href={product.href}
      target={product.download ? undefined : "_blank"}
      rel={product.download ? undefined : "noreferrer"}
      download={product.download}
      className={`group block min-w-0 rounded-2xl border border-white/10 bg-gradient-to-br ${product.accentClass} p-3 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] sm:p-4`}
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
        target={product.download ? undefined : "_blank"}
        rel={product.download ? undefined : "noreferrer"}
        download={product.download}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-center text-sm font-semibold leading-snug text-white transition hover:border-[#2AABEE]/70 hover:bg-[#2AABEE]/20 sm:w-fit"
      >
        {product.actionLabel}
      </a>
    </article>
  );
}

export function PublicHomeHeader({ trackedTelegramBotUrl }: PublicHomeHeaderProps = {}) {
  const headerCtaUrl = trackedTelegramBotUrl ?? getTrackedTelegramBotFallback();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07111f]/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-2xl border border-white/20 shadow-[0_12px_28px_rgba(0,0,0,0.24)] sm:h-10 sm:w-10">
            <Image
              src={BOT_LOGO_PATH}
              alt="Deutsch Quiz Arena Logo"
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <span className="min-w-0 text-base font-bold leading-tight text-white">
            Deutsch Quiz Arena
          </span>
        </Link>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <nav aria-label="Primary" className="flex min-w-0 flex-wrap gap-1.5 text-sm text-slate-300 sm:gap-2">
            {publicNavigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-transparent px-2.5 py-2 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white sm:px-3"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href={headerCtaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#2AABEE] px-4 py-2 text-center text-sm font-semibold leading-snug text-white shadow-[0_12px_26px_rgba(42,171,238,0.28)] transition hover:bg-[#169bdc] sm:w-auto"
            data-analytics-event="hero_cta_click"
            data-analytics-section="header"
            data-analytics-cta="telegram_bot"
          >
            Quiz-Bot starten
          </a>
        </div>
      </div>
    </header>
  );
}

export function PublicHomeHero({ trackedTelegramBotUrl }: PublicHomeHeroProps) {
  const liveProducts = getProjectCards(trackedTelegramBotUrl);

  return (
    <section id="hero" className="grid min-w-0 gap-6 py-8 sm:gap-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-20">
      <div className="flex min-w-0 flex-col justify-center">
        <p className="inline-flex max-w-full rounded-full border border-[#4DE2C6]/25 bg-[#4DE2C6]/10 px-3 py-1 text-xs font-semibold uppercase leading-snug text-[#4DE2C6]">
          Lern-Ökosystem für Deutsch, Wissen und digitale Tools
        </p>
        <h1 className="mt-5 max-w-4xl break-words text-[2rem] font-semibold leading-[1.08] text-white sm:text-5xl sm:leading-tight lg:text-6xl">
          Deutsch lernen. Wissen testen. Jeden Tag besser werden.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
          Deutsch Quiz Arena ist ein wachsendes Lern-Ökosystem mit Quiz-Bot,
          Telegram-Kanälen, Unterricht, IT-Quiz und eigenen digitalen Tools.
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
            Quiz-Bot starten
          </a>
          <a
            href="#projects"
            className={`w-full sm:w-auto ${SECONDARY_BUTTON_CLASS}`}
            data-analytics-event="hero_cta_click"
            data-analytics-section="hero"
            data-analytics-cta="projects_anchor"
          >
            Projekte entdecken
          </a>
        </div>
      </div>

      <aside className={`${GLASS_CARD_CLASS} min-w-0 p-4 sm:p-6`} aria-label="Live-Projekte">
        <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#FFD166]">Live-Projekte</p>
            <h2 className="mt-1 break-words text-xl font-semibold text-white sm:text-2xl">
              Ein Einstieg, mehrere Wege.
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-[#4DE2C6]/30 bg-[#4DE2C6]/10 px-3 py-1 text-xs font-semibold text-[#4DE2C6]">
            aktiv
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
    <section id="stats" className="py-5 sm:py-6">
      <div className={`${GLASS_CARD_CLASS} min-w-0 p-4 sm:p-6`}>
        <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#FFD166]">Live-Statistik</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Die Arena wächst</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Echte Menschen. Echte Nutzung. Jeden Tag mehr Bewegung.
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
    <section id="quiz-teaser" className="py-7 sm:py-8">
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
    <section id="channel" className="py-6">
      <div
        className={`${GLASS_CARD_CLASS} flex min-w-0 flex-col gap-5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6`}
      >
        <div className="flex min-w-0 items-start gap-4">
          <ProductIcon
            product={{
              title: "Deutsch ist einfach! Schule",
              eyebrow: "Telegram-Kanal",
              description: "",
              href: telegramChannelUrl,
              actionLabel: "Kanal öffnen",
              imageSrc: CHANNEL_LOGO_PATH,
              imageAlt: "Deutsch ist einfach! Schule Logo",
              accentClass: "",
            }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#4DE2C6]">Telegram-Kanal</p>
            <h3 className="mt-1 break-words text-lg font-semibold text-white sm:text-xl">
              Deutsch ist einfach! Schule
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
    <section id="bot" className="py-8 sm:py-10">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#4DE2C6]">Deutsch Quiz Arena Bot</p>
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
            Quiz-Bot starten
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
    <section id="projects" className="py-8 sm:py-10">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#FFD166]">Unsere Projekte</p>
          <h2 className="mt-2 break-words text-2xl font-semibold text-white sm:text-4xl">
            Unsere Projekte
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-300">
          Ein kompaktes Produkt- und Lernsystem rund um Deutsch, Wissen, Unterricht und eigene
          digitale Werkzeuge.
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
    <section id="knowledge" className="py-8 sm:py-10">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#4DE2C6]">Wissen & Tipps</p>
          <h2 className="mt-2 break-words text-2xl font-semibold text-white sm:text-4xl">
            Wissen & Tipps
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-slate-300">
          Lesestoff für Orientierung, Prüfungsvorbereitung und ein besseres Gefühl für Sprache.
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
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#FFD166]/70 hover:bg-[#FFD166]/10 sm:w-fit"
            >
              Lesen
            </Link>
          </article>
        ))}
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
      <section id="unterricht" className="py-8 sm:py-10">
        <div
          className={`${GLASS_CARD_CLASS} grid min-w-0 gap-5 p-4 sm:gap-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center`}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#FFD166]">Unterricht</p>
            <h2 className="mt-2 max-w-3xl break-words text-2xl font-semibold leading-tight text-white sm:text-4xl">
              Du willst nicht nur Quizze machen, sondern richtig lernen?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:leading-8">
              Dann kannst du Unterricht, Prüfungstraining oder einen passenden Deutschkurs
              anfragen.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenStudentWizard}
            data-wizard="student"
            className={`w-full sm:w-auto ${ORANGE_BUTTON_CLASS}`}
          >
            Deutsch-Unterricht anfragen
          </button>
        </div>
      </section>

      <section id="contact" className="py-8 sm:py-10">
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch">
          <article className={`${GLASS_CARD_CLASS} min-w-0 p-4 sm:p-8`}>
            <p className="text-sm font-semibold text-[#4DE2C6]">Kooperation / Partnerschaft</p>
            <h2 className="mt-2 break-words text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Gemeinsam Lernräume bauen, die wirklich genutzt werden.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:leading-8">
              Deutsch Quiz Arena ist offen für Partner, Kanäle, Lehrkräfte, Schulen und
              Lerncommunities, die Deutschlernen, Quizformate oder digitale Bildungsprodukte
              sinnvoll verbinden wollen.
            </p>
            <button
              type="button"
              onClick={onOpenPartnerWizard}
              data-wizard="partner"
              className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#4DE2C6]/30 bg-[#4DE2C6]/10 px-5 py-2.5 text-center text-sm font-semibold leading-snug text-[#B9FFF2] transition hover:bg-[#4DE2C6]/20 sm:w-auto"
            >
              Kontakt aufnehmen
            </button>
          </article>

          <div className="grid min-w-0 gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {["Kanäle", "Lehrkräfte", "Schulen & Communities"].map((item) => (
              <article key={item} className="min-w-0 rounded-2xl border border-white/10 bg-[#0b1726] p-4 sm:rounded-3xl sm:p-5">
                <h3 className="break-words text-lg font-semibold text-white">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Seriöse Zusammenarbeit mit klaren Zielen, passendem Format und realistischem
                  Timing.
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
        <p>© 2026 Deutsch Quiz Arena</p>
        <nav aria-label="Footer" className="flex min-w-0 flex-wrap gap-3">
          <Link href="/impressum" className="transition hover:text-white">
            Impressum
          </Link>
          <Link href="/privacy" className="transition hover:text-white">
            Datenschutz
          </Link>
          <Link href="/contact" className="transition hover:text-white">
            Kontakt
          </Link>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Telegram
          </a>
        </nav>
      </div>
    </footer>
  );
}
