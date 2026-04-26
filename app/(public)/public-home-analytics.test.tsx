/* @vitest-environment jsdom */

import { type ReactElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import PublicHomeClient from "./public-home-client";

const trackEventSpy = vi.fn();
const eventNameToPayload = new Map<string, unknown[]>();

vi.mock("@/app/analytics-provider", () => ({
  usePublicAnalytics: () => ({
    trackEvent: (...args: unknown[]) => {
      const [name, payload] = args;
      const list = eventNameToPayload.get(String(name)) ?? [];
      list.push(payload);
      eventNameToPayload.set(String(name), list);
      trackEventSpy(name, payload);
    },
  }),
}));

vi.mock("./public-home-data", () => ({
  usePublicStats: () => ({
    users: 100,
    quizzes: 42,
    isUnavailable: false,
  }),
}));

vi.mock("next/font/google", () => ({
  Inter: () => ({
    className: "inter-font",
  }),
}));

vi.mock("./_components/contact-wizards", () => ({
  ContactWizardModal: ({ kind, isOpen }: { kind: string; isOpen: boolean }) =>
    isOpen ? <div data-wizard-open={kind} /> : null,
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
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
  eventNameToPayload.clear();
  trackEventSpy.mockClear();
});

describe("public home analytics event wiring", () => {
  it("ignores clicks on elements without analytics markers", () => {
    const { container, cleanup } = renderInContainer(<PublicHomeClient />);

    try {
      const homeLink = container.querySelector<HTMLAnchorElement>('a[href="/"]');
      expect(homeLink).not.toBeNull();

      act(() => {
        homeLink?.click();
      });

      expect(trackEventSpy).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });

  it("tracks hero and channel CTA clicks via delegated listener", () => {
    const { container, cleanup } = renderInContainer(<PublicHomeClient />);

    try {
      const heroButton = container.querySelector<HTMLButtonElement>(
        '[data-analytics-event="hero_cta_click"][data-analytics-section="hero"]',
      );
      const channelButton = container.querySelector<HTMLButtonElement>(
        '[data-analytics-event="channel_cta_click"][data-analytics-section="channel"]',
      );

      expect(heroButton).not.toBeNull();
      expect(channelButton).not.toBeNull();

      act(() => {
        heroButton?.click();
      });
      act(() => {
        channelButton?.click();
      });

      expect(trackEventSpy).toHaveBeenCalledWith("hero_cta_click", expect.any(Object));
      expect(trackEventSpy).toHaveBeenCalledWith(
        "channel_cta_click",
        expect.objectContaining({ section: "channel", cta: "telegram_channel" }),
      );
    } finally {
      cleanup();
    }
  });

  it("tracks analytics on nested CTA interaction via closest delegation", () => {
    const { container, cleanup } = renderInContainer(<PublicHomeClient />);

    try {
      const heroButton = container.querySelector<HTMLButtonElement>(
        '[data-analytics-event="hero_cta_click"][data-analytics-section="hero"]',
      );
      expect(heroButton).not.toBeNull();

      const nestedMark = document.createElement("span");
      nestedMark.textContent = "inner";
      heroButton?.appendChild(nestedMark);

      act(() => {
        nestedMark.click();
      });

      expect(trackEventSpy).toHaveBeenCalledWith(
        "hero_cta_click",
        expect.objectContaining({ section: "hero", cta: "telegram_bot" }),
      );
    } finally {
      cleanup();
    }
  });

  it("tracks a single CTA click only once", () => {
    const { container, cleanup } = renderInContainer(<PublicHomeClient />);

    try {
      const heroButton = container.querySelector<HTMLButtonElement>(
        '[data-analytics-event="hero_cta_click"][data-analytics-section="hero"]',
      );
      expect(heroButton).not.toBeNull();

      trackEventSpy.mockClear();

      act(() => {
        heroButton?.click();
      });

      expect(trackEventSpy).toHaveBeenCalledTimes(1);
      expect(trackEventSpy).toHaveBeenCalledWith(
        "hero_cta_click",
        expect.objectContaining({ section: "hero", cta: "telegram_bot" }),
      );
    } finally {
      cleanup();
    }
  });

  it("tracks wizard_open for both student and partner entry points", () => {
    const { container, cleanup } = renderInContainer(<PublicHomeClient />);

    try {
      const studentButton = Array.from(container.querySelectorAll("button")).find((button) =>
        button.textContent?.includes("Anfrage senden"),
      );
      const partnerButton = Array.from(container.querySelectorAll("button")).find((button) =>
        button.textContent?.includes("Kontakt aufnehmen"),
      );

      expect(studentButton).not.toBeNull();
      expect(partnerButton).not.toBeNull();

      act(() => {
        studentButton?.click();
      });
      expect(trackEventSpy).toHaveBeenCalledWith(
        "wizard_open",
        expect.objectContaining({ wizard_type: "student", source: "home_contact_section" }),
      );

      act(() => {
        partnerButton?.click();
      });
      expect(trackEventSpy).toHaveBeenCalledWith(
        "wizard_open",
        expect.objectContaining({ wizard_type: "partner", source: "home_contact_section" }),
      );
    } finally {
      cleanup();
    }
  });
});
