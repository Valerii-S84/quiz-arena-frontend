import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
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
        "Deutsch lernen mit Telegram: tägliche Quizze, klare Lernpfade und Fortschrittsanalyse für Lernende und Teams.",
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
    expect(projectsMetadata.title).toBe("Projekte");
    expect(contactMetadata.title).toBe("Kontakt");
    expect(privacyMetadata.title).toBe("Datenschutz");
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
        "public",
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
});
