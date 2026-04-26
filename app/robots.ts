import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/public-site-config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    sitemap: `${siteUrl}/sitemap.xml`,
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"],
      },
    ],
  };
}
