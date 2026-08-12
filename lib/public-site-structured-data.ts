import {
  PUBLIC_SITE_LOGO_HEIGHT,
  PUBLIC_SITE_LOGO_PATH,
  PUBLIC_SITE_LOGO_WIDTH,
  PUBLIC_SITE_NAME,
  getSiteUrl,
} from "@/lib/public-site-config";

export function buildPublicSiteStructuredData() {
  const siteUrl = getSiteUrl();
  const organizationId = `${siteUrl}/#organization`;
  const logoUrl = new URL(PUBLIC_SITE_LOGO_PATH, siteUrl).toString();

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: PUBLIC_SITE_NAME,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
        width: PUBLIC_SITE_LOGO_WIDTH,
        height: PUBLIC_SITE_LOGO_HEIGHT,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: PUBLIC_SITE_NAME,
      url: siteUrl,
      inLanguage: "de",
      publisher: {
        "@id": organizationId,
      },
    },
  ];
}
