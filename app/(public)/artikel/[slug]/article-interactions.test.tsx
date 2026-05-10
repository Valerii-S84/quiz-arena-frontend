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
});
