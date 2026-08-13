import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ARTICLE_SERVER_RENDERED_PAYLOAD } from "@/lib/article-server-rendered-content";
import ArticlePage from "./page";

const TARGET_SLUG = "pruefungen-goethe-telc-testdaf";
const ARTICLE_DOCUMENT_CLASS = "dq-article-document";

async function renderTargetArticle() {
  const markup = renderToStaticMarkup(
    await ArticlePage({
      params: Promise.resolve({ slug: TARGET_SLUG }),
    }),
  );

  document.body.innerHTML = markup;
}

describe("Prüfungen article responsive layout", () => {
  it("renders a responsive table of contents from stable article heading anchors", async () => {
    await renderTargetArticle();

    const tocLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("[data-article-toc-link]"),
    );
    const headingIds = Array.from(
      document.querySelectorAll<HTMLElement>("[data-article-toc-heading='true']"),
      (heading) => heading.id,
    );
    const tocLabels = tocLinks.map((link) => link.textContent?.trim());

    expect(document.querySelector("details.lg\\:hidden summary")?.textContent).toContain(
      "Inhaltsverzeichnis",
    );
    expect(document.querySelector("nav.lg\\:block")?.textContent).toContain(
      "Inhaltsverzeichnis",
    );
    expect(tocLabels).toContain("Goethe-Institut — Goethe-Zertifikat");
    expect(tocLabels).toContain("telc — The European Language Certificates");
    expect(headingIds).toContain("artikel-goethe-institut-goethe-zertifikat");
    expect(headingIds).toContain("artikel-telc-the-european-language-certificates");

    for (const link of tocLinks) {
      const targetId = decodeURIComponent(link.hash.slice(1));
      expect(document.getElementById(targetId)).not.toBeNull();
    }
  });

  it("keeps the exams table readable as mobile cards instead of clipping columns", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });

    await renderTargetArticle();

    const articleDocument = document.querySelector(`.${ARTICLE_DOCUMENT_CLASS}`);
    const levelTable = document.querySelector(".level-table");
    const bigTable = document.querySelector(".big-table");
    const rows = Array.from(levelTable?.querySelectorAll("tbody tr") ?? []);
    const renderedStyles = Array.from(document.querySelectorAll("style"))
      .map((style) => style.textContent ?? "")
      .join("\n");

    expect(articleDocument?.className).not.toContain("overflow-hidden");
    expect(levelTable).not.toBeNull();
    expect(bigTable).not.toBeNull();
    expect(rows).toHaveLength(6);
    expect(renderedStyles).toContain("@media (max-width: 640px)");
    expect(renderedStyles).toContain(`.${ARTICLE_DOCUMENT_CLASS} .level-table tr`);
    expect(renderedStyles).toContain(`.${ARTICLE_DOCUMENT_CLASS} .level-table td`);
    expect(renderedStyles).toContain(`.${ARTICLE_DOCUMENT_CLASS} .big-table tr`);
    expect(renderedStyles).toContain(`.${ARTICLE_DOCUMENT_CLASS} .big-table td`);
    expect(renderedStyles).toContain(`.${ARTICLE_DOCUMENT_CLASS} .section-header h2`);
    expect(renderedStyles).toContain("white-space: normal;");
    expect(renderedStyles).toContain('content: "Niveau";');
    expect(renderedStyles).toContain('content: "Hören";');
    expect(renderedStyles).toContain('content: "Lesen";');
    expect(renderedStyles).toContain('content: "Schreiben";');
    expect(renderedStyles).toContain('content: "Sprechen";');
    expect(renderedStyles).toContain('content: "Gesamt";');
    expect(renderedStyles).toContain('content: "Prüfung";');
    expect(renderedStyles).toContain('content: "Niveaus";');
    expect(renderedStyles).toContain('content: "Anerkannt";');

    const visibleText = document.body.textContent ?? "";
    for (const value of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
      expect(visibleText).toContain(value);
    }
    for (const skill of ["Hören", "Lesen", "Schreiben", "Sprechen"]) {
      expect(visibleText).toContain(skill);
    }
  });

  it("keeps the static article payload complete for the certificate table", () => {
    const article = ARTICLE_SERVER_RENDERED_PAYLOAD[TARGET_SLUG];
    const parser = new DOMParser();
    const documentFragment = parser.parseFromString(article.content, "text/html");
    const levelTable = documentFragment.querySelector(".level-table");
    const examsRows = Array.from(levelTable?.querySelectorAll("tbody tr") ?? []);

    expect(examsRows).toHaveLength(6);
    expect(examsRows.map((row) => row.querySelector("td")?.textContent?.trim())).toEqual([
      "A1",
      "A2",
      "B1",
      "B2",
      "C1",
      "C2",
    ]);
  });
});
