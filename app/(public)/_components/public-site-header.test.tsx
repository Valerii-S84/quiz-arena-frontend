/* @vitest-environment jsdom */

import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PublicSiteHeader } from "./public-site-header";

vi.mock("@/app/analytics-provider", () => ({
  usePublicAnalytics: () => ({ trackEvent: vi.fn() }),
}));

function renderInContainer(ui: ReactElement) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(ui);
  });

  return {
    container,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

describe("PublicSiteHeader mobile navigation", () => {
  it("stays collapsed until the menu button is used and closes on Escape", () => {
    const { container, cleanup } = renderInContainer(<PublicSiteHeader />);

    try {
      const menuButton = container.querySelector<HTMLButtonElement>("button[aria-controls]");
      expect(menuButton).not.toBeNull();
      expect(menuButton?.getAttribute("aria-expanded")).toBe("false");

      const mobileNavigation = document.getElementById(
        menuButton?.getAttribute("aria-controls") ?? "",
      );
      expect(mobileNavigation?.classList.contains("hidden")).toBe(true);

      act(() => menuButton?.click());

      expect(menuButton?.getAttribute("aria-expanded")).toBe("true");
      expect(mobileNavigation?.classList.contains("hidden")).toBe(false);

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      expect(menuButton?.getAttribute("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(menuButton);
    } finally {
      cleanup();
    }
  });
});
