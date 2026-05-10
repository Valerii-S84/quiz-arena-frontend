import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLE_EMBEDS } from "@/lib/article-definitions";
import { ARTICLE_SERVER_RENDERED_PAYLOAD } from "@/lib/article-server-rendered-content";
import { getSiteUrl } from "@/lib/public-site-config";
import { ArticleInteractions } from "./article-interactions";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const ARTICLE_DOCUMENT_CLASS = "dq-article-document";
const ARTICLE_DEFAULT_OPEN_SECTIONS: Record<string, string> = {
  "deutsche-sprache-geschichte": "era-indg",
  "pruefungen-goethe-telc-testdaf": "prov-goethe",
  "sprachniveaus-a1-c1": "lv-a1",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ARTICLE_EMBEDS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLE_EMBEDS[slug];

  if (!article) {
    return {
      title: "Artikel nicht gefunden",
    };
  }

  const canonical = `/artikel/${slug}`;

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description: article.description,
      images: [
        {
          url: "/logo/bot-logo.jpg",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
  };
}

function embeddedArticleTheme(): string {
  return `
.${ARTICLE_DOCUMENT_CLASS} {
  --bg: #0b1220;
  --surface: rgba(15, 23, 42, 0.72);
  --border: rgba(148, 163, 184, 0.18);
  --text: #eaf2ff;
  --muted: #a9b7c9;
  --accent: #facc15;
  --a0-bg: rgba(155,155,155,0.14);
  --a1-bg: rgba(110,198,224,0.14);
  --a2-bg: rgba(77,184,168,0.14);
  --b1-bg: rgba(126,200,110,0.14);
  --b2-bg: rgba(200,184,78,0.14);
  --c1-bg: rgba(224,120,72,0.14);
  --c2-bg: rgba(208,72,112,0.14);
  background:
    radial-gradient(circle at top, rgba(250, 204, 21, 0.08), transparent 36%),
    linear-gradient(180deg, rgba(2, 8, 23, 0.16), rgba(2, 8, 23, 0.02)),
    linear-gradient(180deg, #07111f 0%, #0b1220 100%);
  color: var(--text);
  font-weight: 400;
  line-height: 1.78;
}
.${ARTICLE_DOCUMENT_CLASS} * {
  box-sizing: border-box;
}
.${ARTICLE_DOCUMENT_CLASS} p,
.${ARTICLE_DOCUMENT_CLASS} li,
.${ARTICLE_DOCUMENT_CLASS} td,
.${ARTICLE_DOCUMENT_CLASS} dd {
  color: var(--text);
  font-weight: 400;
}
.${ARTICLE_DOCUMENT_CLASS} .container {
  max-width: min(100%, 58rem);
}
.${ARTICLE_DOCUMENT_CLASS} .card-block,
.${ARTICLE_DOCUMENT_CLASS} .tip-card,
.${ARTICLE_DOCUMENT_CLASS} .ag-cell,
.${ARTICLE_DOCUMENT_CLASS} .cefr-group,
.${ARTICLE_DOCUMENT_CLASS} .notice,
.${ARTICLE_DOCUMENT_CLASS} .time-badge,
.${ARTICLE_DOCUMENT_CLASS} .exams-table th,
.${ARTICLE_DOCUMENT_CLASS} .era-block,
.${ARTICLE_DOCUMENT_CLASS} .fg-cell,
.${ARTICLE_DOCUMENT_CLASS} .keyfact-card,
.${ARTICLE_DOCUMENT_CLASS} .laut-cell {
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 18px 40px rgba(2, 6, 23, 0.16);
}
.${ARTICLE_DOCUMENT_CLASS} .card-description,
.${ARTICLE_DOCUMENT_CLASS} .tip-desc,
.${ARTICLE_DOCUMENT_CLASS} .ag-desc,
.${ARTICLE_DOCUMENT_CLASS} .cefr-group-sub,
.${ARTICLE_DOCUMENT_CLASS} .card-subtitle {
  color: var(--muted);
}
.${ARTICLE_DOCUMENT_CLASS} .exams-table td,
.${ARTICLE_DOCUMENT_CLASS} .compare-table td,
.${ARTICLE_DOCUMENT_CLASS} .compare-table th,
.${ARTICLE_DOCUMENT_CLASS} .example-item .translation,
.${ARTICLE_DOCUMENT_CLASS} .text-example .translation,
.${ARTICLE_DOCUMENT_CLASS} .fg-langs,
.${ARTICLE_DOCUMENT_CLASS} .laut-ex {
  color: var(--muted);
}
.${ARTICLE_DOCUMENT_CLASS} .exams-table tr:hover td {
  background: rgba(255, 255, 255, 0.04);
}
.${ARTICLE_DOCUMENT_CLASS} .grammar-tag,
.${ARTICLE_DOCUMENT_CLASS} .feature-tag,
.${ARTICLE_DOCUMENT_CLASS} .text-example,
.${ARTICLE_DOCUMENT_CLASS} .example-item,
.${ARTICLE_DOCUMENT_CLASS} .fact-box,
.${ARTICLE_DOCUMENT_CLASS} .era-description,
.${ARTICLE_DOCUMENT_CLASS} .card-description {
  background: rgba(8, 15, 31, 0.7);
  border-color: var(--border);
}
.${ARTICLE_DOCUMENT_CLASS} .hero-sub,
.${ARTICLE_DOCUMENT_CLASS} .section-header h2,
.${ARTICLE_DOCUMENT_CLASS} .group-label,
.${ARTICLE_DOCUMENT_CLASS} .timeline-labels,
.${ARTICLE_DOCUMENT_CLASS} .progress-labels,
.${ARTICLE_DOCUMENT_CLASS} footer,
.${ARTICLE_DOCUMENT_CLASS} footer p {
  color: var(--muted);
}
`;
}

function buildArticleStructuredData(slug: string, title: string, description: string, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: `${siteUrl}/artikel/${slug}`,
    inLanguage: "de",
    publisher: {
      "@type": "Organization",
      name: "Deutsch Quiz Arena",
    },
  };
}

function buildArticleBreadcrumbStructuredData(
  slug: string,
  title: string,
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Startseite",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Wissen",
        item: `${siteUrl}/#knowledge`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${siteUrl}/artikel/${slug}`,
      },
    ],
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = ARTICLE_EMBEDS[slug];
  const articlePayload = ARTICLE_SERVER_RENDERED_PAYLOAD[slug];

  if (!article) {
    notFound();
  }

  if (!articlePayload) {
    notFound();
  }

  const articleHtml = articlePayload.content;
  const articleStyles = `${embeddedArticleTheme()}\n${articlePayload.styles}`;

  return (
    <main
      lang="de"
      className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.12),transparent_26%),linear-gradient(180deg,#020617_0%,#07111f_42%,#0b1220_100%)] text-slate-100"
    >
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/72 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-start">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-amber-300/30 hover:bg-white/10 hover:text-amber-100"
          >
            ← Zur Startseite
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <article className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/40 shadow-[0_28px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <style
            dangerouslySetInnerHTML={{
              __html: articleStyles,
            }}
          />
          <div
            className={`${ARTICLE_DOCUMENT_CLASS} overflow-hidden rounded-[28px]`}
            dangerouslySetInnerHTML={{
              __html: articleHtml,
            }}
          />
          <ArticleInteractions defaultOpenSectionId={ARTICLE_DEFAULT_OPEN_SECTIONS[slug]} />
        </article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildArticleStructuredData(slug, article.title, article.description, getSiteUrl())),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildArticleBreadcrumbStructuredData(slug, article.title, getSiteUrl())),
          }}
        />
      </div>
    </main>
  );
}
