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

  it("adds analytics dataset metadata to conversion CTAs", () => {
    const botUrl = getTelegramBotUrl();
    const trackedUrl = buildTrackedTelegramBotUrl(botUrl, TELEGRAM_BOT_START_PAYLOAD);

    const html = renderToStaticMarkup(
      <PublicHomeHero trackedTelegramBotUrl={trackedUrl} />,
    );

    expect(html).toContain("data-analytics-event=\"hero_cta_click\"");
    expect(html).toContain("data-analytics-section=\"hero\"");
    expect(html).toContain("data-analytics-cta=\"telegram_bot\"");
    expect(html).toContain("data-analytics-cta=\"contact_anchor\"");
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

  it("keeps shared wizard modal with dialog description", () => {
    const source = readFile(
      join(process.cwd(), "app", "(public)", "_components", "contact-wizard-shared.tsx"),
    );

    expect(source).toContain("Dialog.Description");
    expect(source).toContain("Dialog.Title");
    expect(source).toContain("Dialog.Close asChild");
  });

  it("adds explicit labels and aria metadata to student wizard form", () => {
    const source = readFile(
      join(process.cwd(), "app", "(public)", "_components", "contact-wizard-student.tsx"),
    );

    expect(source).toContain("STUDENT_ERROR_ID");
    expect(source).toContain('htmlFor={STUDENT_NAME_FIELD_ID}');
    expect(source).toContain('htmlFor={STUDENT_CONTACT_FIELD_ID}');
    expect(source).toContain('aria-required="true"');
    expect(source).toContain('aria-invalid={errorFieldId === STUDENT_NAME_FIELD_ID}');
    expect(source).toContain('aria-describedby={errorFieldId === STUDENT_CONTACT_FIELD_ID ? STUDENT_ERROR_ID : undefined}');
    expect(source).toContain('ValidationResult');
    expect(source).toContain('useEffect(() => {');
    expect(source).toContain("role=\"alert\"");
  });

  it("adds explicit labels and aria metadata to partner wizard form", () => {
    const source = readFile(
      join(process.cwd(), "app", "(public)", "_components", "contact-wizard-partner.tsx"),
    );

    expect(source).toContain("PARTNER_ERROR_ID");
    expect(source).toContain('htmlFor={PARTNER_NAME_FIELD_ID}');
    expect(source).toContain('htmlFor={PARTNER_CONTACT_FIELD_ID}');
    expect(source).toContain('aria-required="true"');
    expect(source).toContain('aria-invalid={errorFieldId === PARTNER_NAME_FIELD_ID}');
    expect(source).toContain('aria-describedby={errorFieldId === PARTNER_CONTACT_FIELD_ID ? PARTNER_ERROR_ID : undefined}');
    expect(source).toContain('ValidationResult');
    expect(source).toContain('useEffect(() => {');
    expect(source).toContain("role=\"alert\"");
  });
});

describe("admin login accessibility contract", () => {
  it("renders admin login modal with visible labels and required ARIA metadata", () => {
    const source = readFile(
      join(process.cwd(), "app", "(public)", "public-home-admin-login-modal.tsx"),
    );

    expect(source).toContain("import * as Dialog from \"@radix-ui/react-dialog\";");
    expect(source).toContain("Dialog.Root");
    expect(source).toContain("Dialog.Title");
    expect(source).toContain("Dialog.Description");
    expect(source).toContain("Dialog.Close asChild");
    expect(source).toContain('htmlFor={loginInputId}');
    expect(source).toContain('htmlFor={passwordInputId}');
    expect(source).toContain('aria-required="true"');
    expect(source).toContain('aria-describedby={loginFeedback ? errorId : undefined}');
    expect(source).toContain('id={errorId}');
  });
});

describe("admin login form labels and aria states", () => {
  it("adds labels and validation metadata to admin login page", () => {
    const source = readFile(
      join(process.cwd(), "app", "(admin)", "admin", "login", "page.tsx"),
    );

    expect(source).toContain("htmlFor=\"admin-email\"");
    expect(source).toContain("htmlFor=\"admin-password\"");
    expect(source).toContain("htmlFor=\"admin-2fa-code\"");
    expect(source).toContain('aria-invalid={form.formState.errors.email ? "true" : "false"}');
    expect(source).toContain('aria-describedby={form.formState.errors.password ? "admin-password-error" : undefined}');
    expect(source).toContain('id="admin-login-error"');
    expect(source).toContain('role="alert"');
    expect(source).toContain("document.getElementById(\"admin-email\")?.focus();");
  });
});
