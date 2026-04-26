import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/public-site-config";
import { ARTICLE_SLUGS } from "@/lib/article-definitions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedAt = new Date();
  const siteUrl = getSiteUrl();

  const publicRoutes = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/impressum`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const articleUrls = ARTICLE_SLUGS.map((slug) => ({
    url: `${siteUrl}/artikel/${slug}`,
    lastModified: publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return publicRoutes.map((route) => ({
    url: route.url,
    lastModified: publishedAt,
    changeFrequency: route.changeFrequency as
      | "monthly"
      | "weekly"
      | "yearly"
      | "daily"
      | "always"
      | "hourly"
      | "never",
    priority: route.priority,
  })).concat(articleUrls);
}
