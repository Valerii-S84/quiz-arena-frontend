import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/font/google", () => ({
  Fraunces: () => ({
    className: "fraunces-font",
  }),
  Inter: () => ({
    className: "inter-font",
  }),
  Space_Grotesk: () => ({
    className: "space-grotesk-font",
  }),
}));

import { metadata as homeMetadata } from "@/app/(public)/page";
import * as articlePage from "@/app/(public)/artikel/[slug]/page";
import { metadata as contactMetadata } from "@/app/(public)/contact/page";
import { metadata as impressumMetadata } from "@/app/(public)/impressum/page";
import { metadata as privacyMetadata } from "@/app/(public)/privacy/page";
import { metadata as projectsMetadata } from "@/app/(public)/projects/page";
import { metadata as rootMetadata } from "@/app/layout";
import { getSiteUrl } from "@/lib/public-site-config";
import { extractArticleBodyAndStyles } from "@/lib/article-content";
import { ARTICLE_EMBEDS, ARTICLE_SLUGS } from "@/lib/article-definitions";
import { ARTICLE_SERVER_RENDERED_PAYLOAD } from "@/lib/article-server-rendered-content";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

type JsonLdPayload = Record<string, unknown>;

function parseJsonLdScripts(html: string): JsonLdPayload[] {
  const matches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);

  return Array.from(matches).map((match) => {
    const raw = match[1];
    return JSON.parse(raw) as JsonLdPayload;
  });
}

describe("public SEO metadata contracts", () => {
  it("defines a consistent root metadata template and Open Graph payload", () => {
    const rootOpenGraph = rootMetadata.openGraph as Record<string, unknown> | undefined;

    expect(rootMetadata).toMatchObject({
      title: {
        default: "Deutsch Quiz Arena",
        template: "%s | Deutsch Quiz Arena",
      },
      description:
        "Deutsch Quiz Arena ist ein Projekt im Aufbau mit Telegram-Quiz, Artikeln und digitalen Lernformaten in Pilotphase.",
      openGraph: {
        type: "website",
        title: "Deutsch Quiz Arena",
      },
      twitter: {
        card: "summary_large_image",
        title: "Deutsch Quiz Arena",
      },
    });

    expect(rootMetadata.metadataBase?.href).toBe(new URL(getSiteUrl()).href);
    expect(rootMetadata.openGraph?.images).toHaveLength(1);
    expect(rootOpenGraph?.type).toBe("website");
  });

  it("exposes dedicated metadata for public landing routes", () => {
    expect(homeMetadata.title).toBe("Startseite");
    expect(homeMetadata.alternates?.canonical).toBe("/");
    expect(projectsMetadata.title).toBe("Projektübersicht");
    expect(contactMetadata.title).toBe("Kontakt");
    expect(privacyMetadata.title).toBe("Datenschutzerklärung");
    expect(impressumMetadata.title).toBe("Impressum");
  });

  it("provides article-level metadata based on known slugs", async () => {
    for (const slug of ARTICLE_SLUGS) {
      const article = ARTICLE_EMBEDS[slug];
      const pageMetadata = await articlePage.generateMetadata({
        params: Promise.resolve({ slug }),
      });
      const articleOpenGraph = pageMetadata.openGraph as Record<string, unknown> | undefined;

      expect(pageMetadata.title).toBe(article.title);
      expect(pageMetadata.description).toBe(article.description);
      expect(pageMetadata.alternates?.canonical).toBe(`/artikel/${slug}`);
      expect(articleOpenGraph?.url).toBe(`/artikel/${slug}`);
      expect(articleOpenGraph?.type).toBe("article");
    }
  });

  it("renders complete structured data for all article pages", async () => {
    const { default: ArticlePage } = await import("./artikel/[slug]/page");
    const siteUrl = getSiteUrl();

    for (const slug of ARTICLE_SLUGS) {
      const article = ARTICLE_EMBEDS[slug];
      const html = renderToStaticMarkup(
        await ArticlePage({
          params: Promise.resolve({ slug }),
        }),
      );

      const jsonLd = parseJsonLdScripts(html);

      const articleData = jsonLd.find((entry) => entry["@type"] === "Article");
      const breadcrumbData = jsonLd.find((entry) => entry["@type"] === "BreadcrumbList");

      expect(articleData).toBeDefined();
      expect(articleData?.headline).toBe(article.title);
      expect(articleData?.description).toBe(article.description);
      expect(articleData?.mainEntityOfPage).toBe(`${siteUrl}/artikel/${slug}`);

      const breadcrumbItems = (breadcrumbData?.itemListElement ?? []) as Array<JsonLdPayload>;
      expect(breadcrumbData).toBeDefined();
      expect(breadcrumbItems).toHaveLength(3);
      expect(breadcrumbItems?.[0]).toMatchObject({
        "@type": "ListItem",
        name: "Startseite",
        position: 1,
      });
      expect(breadcrumbItems?.[1]).toMatchObject({
        "@type": "ListItem",
        name: "Wissen",
        position: 2,
      });
      expect(breadcrumbItems?.[2]).toMatchObject({
        "@type": "ListItem",
        name: article.title,
        position: 3,
      });
    }
  });

  it("returns a stable fallback title for unknown article slugs", async () => {
    const pageMetadata = await articlePage.generateMetadata({
      params: Promise.resolve({ slug: "not-found" }),
    });

    expect(pageMetadata.title).toBe("Artikel nicht gefunden");
  });

  it("keeps the public privacy copy limited to documented legal facts", () => {
    const privacyFilePath = join(process.cwd(), "app", "(public)", "privacy", "page.tsx");
    const source = readFileSync(privacyFilePath, "utf-8");

    expect(source).toContain("Hetzner Online GmbH");
    expect(source).toContain("Analytics-Ereignisse: 90 Tage.");
    expect(source).toContain("6 Monate nach der letzten Bearbeitung");
    expect(source).toContain("Server-, Proxy- und Sicherheitsprotokolle: 14 Tage");
    expect(source).toContain("ist derzeit noch nicht betriebsbereit");

    expect(source).not.toContain("FastAPI");
    expect(source).not.toContain("PostgreSQL");
    expect(source).not.toContain("Redis");
    expect(source).not.toContain("Caddy");
    expect(source).not.toContain("contact_requests");
    expect(source).not.toContain("website_events");
    expect(source).not.toContain("Sentry");
    expect(source).not.toContain("Logtail");
    expect(source).not.toContain("Cloudflare");
    expect(source).not.toContain("Google Analytics");
    expect(source).not.toContain("Matomo");
    expect(source).not.toContain("Plausible");
  });
});

describe("public robots and sitemap contracts", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      return;
    }

    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("generates sitemap URL in robots from site URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://qa.quizarena.test";

    const robotsConfig = robots();

    expect(robotsConfig.sitemap).toBe("https://qa.quizarena.test/sitemap.xml");
    expect(robotsConfig.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAgent: "*", disallow: ["/admin"] }),
      ]),
    );
  });

  it("includes all public routes and article pages in sitemap", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://qa.quizarena.test";

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    const uniqueUrls = new Set(urls);
    const expectedRoutes = [
      "https://qa.quizarena.test/",
      "https://qa.quizarena.test/projects",
      "https://qa.quizarena.test/contact",
      "https://qa.quizarena.test/privacy",
      "https://qa.quizarena.test/impressum",
      ...ARTICLE_SLUGS.map((slug) => `https://qa.quizarena.test/artikel/${slug}`),
    ];

    expect(urls).toEqual(expect.arrayContaining(expectedRoutes));
    expect(urls).not.toContain(
      "https://qa.quizarena.test/artikel/sprachniveaus-a1-c1",
    );
    expect(uniqueUrls.size).toBe(urls.length);
    expect(entries.every((entry) => !!entry.changeFrequency && entry.lastModified instanceof Date)).toBe(
      true,
    );
  });
});

describe("knowledge transport implementation", () => {
  const filePath = join(
    process.cwd(),
    "app",
    "(public)",
    "artikel",
    "[slug]",
    "page.tsx",
  );

  it("does not render knowledge article through iframe srcDoc", () => {
    const source = readFileSync(filePath, "utf-8");

    expect(source).not.toContain("srcDoc=");
    expect(source).not.toContain("<iframe");
    expect(source).toContain("application/ld+json");
    expect(source).toContain("notFound()");
  });

  it("keeps required inline scripts and onclick handlers for article interactivity", () => {
    for (const slug of ARTICLE_SLUGS) {
      const articleFilePath = join(
        process.cwd(),
        "content",
        "artikel",
        ARTICLE_EMBEDS[slug].fileName,
      );
      const sourceArticle = readFileSync(articleFilePath, "utf-8");
      const extracted = extractArticleBodyAndStyles(sourceArticle, "dq-article-document");

      expect(sourceArticle).toContain("<script");
      expect(extracted.content).toContain("<script");
      expect(extracted.content).toContain("onclick=");
      expect(extracted.content).toContain("function ");
    }
  });

  it("keeps generated article payloads synchronized with the editorial sources", () => {
    for (const slug of ARTICLE_SLUGS) {
      const articleFilePath = join(
        process.cwd(),
        "content",
        "artikel",
        ARTICLE_EMBEDS[slug].fileName,
      );
      const sourceArticle = readFileSync(articleFilePath, "utf-8");

      expect(ARTICLE_SERVER_RENDERED_PAYLOAD[slug]).toEqual(
        extractArticleBodyAndStyles(sourceArticle, "dq-article-document"),
      );
    }
  });

  it("preserves the reviewed content corrections", () => {
    const levelsSource = readFileSync(
      join(process.cwd(), "content", "artikel", "sprachniveaus-a0-c2.html"),
      "utf-8",
    );
    const examsSource = readFileSync(
      join(process.cwd(), "content", "artikel", "pruefungen-goethe-telc-testdaf.html"),
      "utf-8",
    );
    const historySource = readFileSync(
      join(process.cwd(), "content", "artikel", "deutsche-sprache-geschichte.html"),
      "utf-8",
    );

    expect(levelsSource).toContain("telc Deutsch C2");
    expect(levelsSource).toContain("A0</strong> ist keine offizielle Bezeichnung");
    expect(levelsSource).not.toContain("Richtwerte des Europarates");
    expect(levelsSource).not.toContain("Mindestniveau für die Zulassung zu den meisten Universitäten");

    expect(examsSource).toContain(
      "Modular sind die Goethe-Zertifikate B1, B2, C1 und C2",
    );
    expect(examsSource).toContain("unterschiedliche Aufgabenportfolios");
    expect(examsSource).not.toContain("Jedes Niveau besteht aus vier klar getrennten Modulen");
    expect(examsSource).not.toContain("A1 – C1 · Integrationsrelevant");

    expect(historySource).toContain("1901/1902");
    expect(historySource).toContain("Eine einzelne, abschließend belegte Ursache gibt es nicht");
  });

  it("defines an exact 301 redirect from the retired levels URL", () => {
    const configSource = readFileSync(join(process.cwd(), "next.config.mjs"), "utf-8");

    expect(configSource).toContain('source: "/artikel/sprachniveaus-a1-c1"');
    expect(configSource).toContain('destination: "/artikel/sprachniveaus-a0-c2"');
    expect(configSource).toContain("statusCode: 301");
  });

  it("keeps raw article source files out of public/ while preserving content sources", () => {
    for (const slug of ARTICLE_SLUGS) {
      const fileName = ARTICLE_EMBEDS[slug].fileName;
      const publicFilePath = join(process.cwd(), "public", "artikel", fileName);
      const contentFilePath = join(process.cwd(), "content", "artikel", fileName);

      expect(existsSync(publicFilePath)).toBe(false);
      expect(existsSync(contentFilePath)).toBe(true);
    }
  });

  it("throws notFound for missing article content during render", async () => {
    const { default: ArticlePage } = await import("./artikel/[slug]/page");

    await expect(
      ArticlePage({
        params: Promise.resolve({ slug: "missing-article" }),
      }),
    ).rejects.toBeDefined();
  });

  it("renders Article and BreadcrumbList structured data on article pages", async () => {
    const { default: ArticlePage } = await import("./artikel/[slug]/page");

    for (const slug of ARTICLE_SLUGS) {
      const article = ARTICLE_EMBEDS[slug];
      const html = renderToStaticMarkup(
        await ArticlePage({
          params: Promise.resolve({ slug }),
        }),
      );

      expect(html).toContain('"@type":"Article"');
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).toContain(`"position":3`);
      expect(html).toContain(`"name":"${article.title}"`);
      expect(html).toContain(`"name":"Wissen"`);
    }
  });

  it("renders article pages inside the dark premium reader shell", async () => {
    const { default: ArticlePage } = await import("./artikel/[slug]/page");

    for (const slug of ["sprachniveaus-a0-c2", "deutsche-sprache-geschichte"] as const) {
      const html = renderToStaticMarkup(
        await ArticlePage({
          params: Promise.resolve({ slug }),
        }),
      );

      expect(html).toContain("← Zur Startseite");
      expect(html).toContain("bg-slate-950/40");
      expect(html).toContain("border-white/10");
      expect(html).toContain("text-slate-100");
      expect(html).toContain("dq-article-document");

      expect(html).not.toContain("bg-white/90");
      expect(html).not.toContain("bg-white/82");
      expect(html).not.toContain("border-slate-200");
      expect(html).not.toContain("--bg: #cedde8");
      expect(html).not.toContain("--surface: #f4f7fa");
    }
  });

  it("keeps the article source files on the dark readable palette", () => {
    const articleFiles = [
      "sprachniveaus-a0-c2.html",
      "deutsche-sprache-geschichte.html",
    ] as const;

    for (const articleFile of articleFiles) {
      const source = readFileSync(
        join(process.cwd(), "content", "artikel", articleFile),
        "utf-8",
      );

      expect(source).toContain("font-weight: 400;");
      expect(source).toContain("--surface: rgba(15, 23, 42, 0.72);");
      expect(source).toContain("--border: rgba(148, 163, 184, 0.18);");
      expect(source).toContain("--text: #eaf2ff;");
      expect(source).toContain("--muted: #a9b7c9;");

      expect(source).not.toContain("font-weight: 300;");
      expect(source).not.toContain("--bg: #cedde8");
      expect(source).not.toContain("--surface: #f4f7fa");
      expect(source).not.toContain("rgba(255,255,255,0.97)");
    }

    const cefrSource = readFileSync(
      join(process.cwd(), "content", "artikel", "sprachniveaus-a0-c2.html"),
      "utf-8",
    );
    const historySource = readFileSync(
      join(process.cwd(), "content", "artikel", "deutsche-sprache-geschichte.html"),
      "utf-8",
    );

    expect(cefrSource).toContain("--bg: #0b1220;");
    expect(cefrSource).toContain("--accent: #facc15;");
    expect(historySource).toContain("--bg: #07111f;");
    expect(historySource).toContain("--accent: #f3cf78;");
  });
});
