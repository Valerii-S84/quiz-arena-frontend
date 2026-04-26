import React from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PublicHomeContactSection,
  PublicHomeHeader,
  PublicHomeHero,
  PublicHomeKnowledgeSection,
} from "./public-home-sections";
import { WISSEN_ARTICLES } from "./public-home-content";
import { buildTrackedTelegramBotUrl } from "./public-home-helpers";
import { TELEGRAM_BOT_START_PAYLOAD, getTelegramBotUrl } from "@/lib/public-site-config";

function readFile(filePath: string): string {
  return readFileSync(filePath, "utf-8");
}

describe("public home scenarios", () => {
  it("renders the hero as conversion-first surface with two CTAs", () => {
    const botUrl = getTelegramBotUrl();
    const trackedUrl = buildTrackedTelegramBotUrl(botUrl, TELEGRAM_BOT_START_PAYLOAD);

    const html = renderToStaticMarkup(
      <PublicHomeHero trackedTelegramBotUrl={trackedUrl} />,
    );

    expect(html).toContain("Bot öffnen");
    expect(html).toContain(`href="${trackedUrl}"`);
    expect(html).toContain("href=\"#contact\"");
    expect(html).toContain("Beratung anfragen");
    expect(html).toContain("start=site_public_home");
  });

  it("includes section-level navigation in header with in-page targets", () => {
    const html = renderToStaticMarkup(<PublicHomeHeader />);

    expect(html).toContain('href="#bot"');
    expect(html).toContain('href="#products"');
    expect(html).toContain('href="#knowledge"');
    expect(html).toContain('href="#contact"');
  });

  it("renders the knowledge section links for all configured article slugs", () => {
    const html = renderToStaticMarkup(<PublicHomeKnowledgeSection />);

    for (const article of WISSEN_ARTICLES) {
      const slug = article.slug;
      expect(html).toContain(`/artikel/${slug}`);
      expect(html).toContain(article.title);
    }
  });

  it("provides distinct student and partner contact entry points", () => {
    const html = renderToStaticMarkup(
      <PublicHomeContactSection onOpenStudentWizard={() => undefined} onOpenPartnerWizard={() => undefined} />,
    );

    expect(html).toContain("Anfrage senden");
    expect(html).toContain("Kontakt aufnehmen");
  });
});

describe("public content isolation", () => {
  it("keeps public page language as German", () => {
    const rootLayout = readFile(join(process.cwd(), "app", "layout.tsx"));
    const articlePage = readFile(join(process.cwd(), "app", "(public)", "artikel", "[slug]", "page.tsx"));

    expect(rootLayout).toContain('lang="de"');
    expect(articlePage).toContain('lang="de"');
  });

  it("does not expose admin login surface from public homepage client code", () => {
    const source = readFile(
      join(process.cwd(), "app", "(public)", "public-home-client.tsx"),
    );

    expect(source).not.toContain("PublicHomeAdminLoginModal");
    expect(source).not.toContain("/admin/login");
    expect(source).not.toContain("admin login");
  });

  it("adds privacy/contact legal paths and avoids placeholder local email on contact page", () => {
    const source = readFile(join(process.cwd(), "app", "(public)", "contact", "page.tsx"));

    expect(source).toContain('/privacy"');
    expect(source).toContain('/impressum"');
    expect(source).not.toContain("ops@quizarena.local");
  });
});

describe("wizard dialog contract", () => {
  it("keeps Radix dialog structure and explicit close description in shared modal", () => {
    const source = readFile(
      join(process.cwd(), "app", "(public)", "_components", "contact-wizard-shared.tsx"),
    );

    expect(source).toContain("Dialog.Title");
    expect(source).toContain("Dialog.Close asChild");
    expect(source).toContain("aria-label=\"Schließen\"");
    expect(source).toContain("Dialog.Portal");
    expect(source).toContain("Dialog.Overlay");
    expect(source).toContain("Dialog.Content");
  });
});
