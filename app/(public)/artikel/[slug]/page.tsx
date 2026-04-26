import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLE_EMBEDS } from "@/lib/article-definitions";
import { extractArticleBodyAndStyles } from "@/lib/article-content";
import { getSiteUrl } from "@/lib/public-site-config";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const ARTICLE_DOCUMENT_CLASS = "dq-article-document";

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
  --bg: #cedde8;
  --surface: #f4f7fa;
  --border: #b8cad6;
  --text: #132233;
  --muted: #31465b;
  --accent: #e8734a;
  --a0-bg: rgba(155,155,155,0.14);
  --a1-bg: rgba(110,198,224,0.14);
  --a2-bg: rgba(77,184,168,0.14);
  --b1-bg: rgba(126,200,110,0.14);
  --b2-bg: rgba(200,184,78,0.14);
  --c1-bg: rgba(224,120,72,0.14);
  --c2-bg: rgba(208,72,112,0.14);
  background: linear-gradient(135deg, #b7d1df 0%, #c4d7bf 50%, #dbcfbf 100%);
  color: var(--text);
  font-weight: 400;
}
.${ARTICLE_DOCUMENT_CLASS} * {
  box-sizing: border-box;
}
.${ARTICLE_DOCUMENT_CLASS} .card-block,
.${ARTICLE_DOCUMENT_CLASS} .tip-card,
.${ARTICLE_DOCUMENT_CLASS} .ag-cell,
.${ARTICLE_DOCUMENT_CLASS} .cefr-group,
.${ARTICLE_DOCUMENT_CLASS} .notice,
.${ARTICLE_DOCUMENT_CLASS} .time-badge,
.${ARTICLE_DOCUMENT_CLASS} .exams-table th {
  background: rgba(255, 255, 255, 0.97);
}
.${ARTICLE_DOCUMENT_CLASS} .card-description,
.${ARTICLE_DOCUMENT_CLASS} .tip-desc,
.${ARTICLE_DOCUMENT_CLASS} .ag-desc,
.${ARTICLE_DOCUMENT_CLASS} .cefr-group-sub,
.${ARTICLE_DOCUMENT_CLASS} .card-subtitle {
  color: #3f556a;
}
.${ARTICLE_DOCUMENT_CLASS} .exams-table tr:hover td {
  background: rgba(15, 23, 42, 0.06);
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

  if (!article) {
    notFound();
  }

  let articleHtml = "";
  let articleStyles = "";
  try {
    articleHtml = await readFile(path.join(process.cwd(), "public", "artikel", article.fileName), "utf-8");
    const preparedArticle = extractArticleBodyAndStyles(articleHtml, ARTICLE_DOCUMENT_CLASS);
    articleHtml = preparedArticle.content;
    articleStyles = `${embeddedArticleTheme()}\n${preparedArticle.styles}`;
  } catch {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,#e8f4f8_0%,#f0f7ee_50%,#fef9f0_100%)] px-4 py-16 text-slate-800 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/40 bg-white/60 p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <h1 className="text-3xl font-semibold">Artikel vorübergehend nicht verfügbar</h1>
          <p className="mt-3 text-sm text-slate-600">Bitte versuchen Sie es in einigen Minuten erneut.</p>
        </div>
      </main>
    );
  }

  return (
    <main
      lang="de"
      className="min-h-screen bg-[linear-gradient(135deg,#c1d8e5_0%,#cde0c7_50%,#e0d5c5_100%)] text-slate-900"
    >
      <div className="sticky top-0 z-20 border-b border-white/60 bg-white/82 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-start">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            ← Zur Startseite
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_4px_26px_rgba(15,23,42,0.06)]">
          <style
            dangerouslySetInnerHTML={{
              __html: articleStyles,
            }}
          />
          <div
            className={`${ARTICLE_DOCUMENT_CLASS} overflow-hidden`}
            dangerouslySetInnerHTML={{
              __html: articleHtml,
            }}
          />
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
