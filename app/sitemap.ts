import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/public-site-config";
import { ARTICLE_EMBEDS, ARTICLE_SLUGS } from "@/lib/article-definitions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const publicRoutes = [
    `${siteUrl}/`,
    `${siteUrl}/wissen`,
    `${siteUrl}/projects`,
    `${siteUrl}/books`,
    `${siteUrl}/contact`,
    `${siteUrl}/privacy`,
    `${siteUrl}/impressum`,
  ];

  const articleUrls = ARTICLE_SLUGS.map((slug) => {
    const article = ARTICLE_EMBEDS[slug];

    return {
      url: `${siteUrl}/artikel/${slug}`,
      lastModified: article.lastModified,
    };
  });

  return publicRoutes.map((url) => ({ url })).concat(articleUrls);
}
