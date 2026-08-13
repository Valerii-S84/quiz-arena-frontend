import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { ArticleInteractions } from "./article-interactions";

describe("ArticleInteractions", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    delete window.toggleCard;
    delete window.toggleEra;
  });

  it.each([
    {
      article: "Sprachniveaus",
      handlerName: "toggleCard",
      sectionId: "lv-a1",
    },
    {
      article: "Geschichte der deutschen Sprache",
      handlerName: "toggleEra",
      sectionId: "era-indg",
    },
  ] as const)("restores expand/collapse for $article article cards", ({ handlerName, sectionId }) => {
    document.body.innerHTML = `<section id="${sectionId}" class="level-card"></section>`;
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);

    act(() => {
      root.render(<ArticleInteractions defaultOpenSectionId={sectionId} />);
    });

    const section = document.getElementById(sectionId);
    expect(section?.classList.contains("open")).toBe(true);

    act(() => {
      window[handlerName]?.(sectionId);
    });

    expect(section?.classList.contains("open")).toBe(false);

    act(() => {
      window[handlerName]?.(sectionId);
    });

    expect(section?.classList.contains("open")).toBe(true);

    act(() => {
      root.unmount();
    });
  });

  it("removes article handlers when the article shell unmounts", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);

    act(() => {
      root.render(<ArticleInteractions />);
    });

    expect(window.toggleCard).toBeTypeOf("function");
    expect(window.toggleEra).toBeTypeOf("function");

    act(() => {
      root.unmount();
    });

    expect(window.toggleCard).toBeUndefined();
    expect(window.toggleEra).toBeUndefined();
  });

  it("makes article disclosures keyboard-operable and keeps their ARIA state current", () => {
    document.body.innerHTML = `
      <section id="prov-goethe" class="prov-card">
        <div class="prov-header" onclick="toggleCard('prov-goethe')">
          <h3 id="artikel-goethe" class="prov-title">Goethe-Institut</h3>
        </div>
        <div class="prov-body">Details</div>
      </section>
    `;
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);

    act(() => {
      root.render(<ArticleInteractions />);
    });

    const section = document.getElementById("prov-goethe");
    const header = document.querySelector<HTMLElement>(".prov-header");
    const body = document.querySelector<HTMLElement>(".prov-body");

    expect(header?.getAttribute("role")).toBe("button");
    expect(header?.tabIndex).toBe(0);
    expect(header?.getAttribute("aria-expanded")).toBe("false");
    expect(header?.getAttribute("aria-controls")).toBe("prov-goethe-content");
    expect(body?.id).toBe("prov-goethe-content");

    act(() => {
      header?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(section?.classList.contains("open")).toBe(true);
    expect(header?.getAttribute("aria-expanded")).toBe("true");

    act(() => {
      header?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    });

    expect(section?.classList.contains("open")).toBe(false);
    expect(header?.getAttribute("aria-expanded")).toBe("false");

    act(() => {
      root.unmount();
    });
  });

  it("opens a collapsed detail card before a table-of-contents anchor is followed", () => {
    document.body.innerHTML = `
      <a data-article-toc-link href="#artikel-zweite-lautverschiebung">Zweite Lautverschiebung</a>
      <section id="era-2ls" class="era-card">
        <div class="era-card-header" onclick="toggleEra('era-2ls')">
          <h3 id="artikel-zweite-lautverschiebung" class="era-title">
            Zweite Lautverschiebung
          </h3>
        </div>
        <div class="era-body">Details</div>
      </section>
    `;
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);

    act(() => {
      root.render(<ArticleInteractions />);
    });

    const link = document.querySelector<HTMLAnchorElement>("[data-article-toc-link]");
    const section = document.getElementById("era-2ls");
    const header = document.querySelector<HTMLElement>(".era-card-header");

    act(() => {
      link?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(section?.classList.contains("open")).toBe(true);
    expect(header?.getAttribute("aria-expanded")).toBe("true");

    act(() => {
      root.unmount();
    });
  });
});
