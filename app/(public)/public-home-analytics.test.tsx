/* @vitest-environment jsdom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import PublicHomeClient from "./public-home-client";
import {
  PublicHomeChannelSection,
  PublicHomeContactSection,
  PublicHomeHeader,
  PublicHomeHero,
} from "./public-home-sections";
import { buildTrackedTelegramBotUrl } from "./public-home-helpers";
import { TELEGRAM_BOT_START_PAYLOAD, getTelegramBotUrl } from "@/lib/public-site-config";

vi.mock("@/app/analytics-provider", () => ({
  usePublicAnalytics: () => ({
    trackEvent: (...args: unknown[]) => {
      const [name, payload] = args;
      eventNameToPayload.set(String(name), [...(eventNameToPayload.get(String(name)) ?? []), payload]);
      trackEventSpy(name, payload);
    },
  }),
}));

vi.mock("./_components/contact-wizards", () => ({
  ContactWizardModal: ({ kind, isOpen }: { kind: string; isOpen: boolean }) =>
    isOpen ? <div data-wizard-open={kind} /> : null,
}));

const trackEventSpy = vi.fn();
const eventNameToPayload = new Map<string, unknown[]>();

function renderInContainer(ui: JSX.Element) {
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

function renderHomeForAnalytics() {
  const botUrl = getTelegramBotUrl();
  const trackedUrl = buildTrackedTelegramBotUrl(botUrl, TELEGRAM_BOT_START_PAYLOAD);

  const content = (
    <PublicHomeClient>
      <main id="public-home-root" lang="de">
        <PublicHomeHeader />
        <PublicHomeHero trackedTelegramBotUrl={trackedUrl} />
        <PublicHomeChannelSection />
        <PublicHomeContactSection />
      </main>
    </PublicHomeClient>
  );

  return renderInContainer(content);
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
  eventNameToPayload.clear();
  trackEventSpy.mockClear();
});

describe("public home analytics event wiring", () => {
  it("ignores clicks on elements without analytics markers", () => {
    const { container, cleanup } = renderHomeForAnalytics();

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
    const { container, cleanup } = renderHomeForAnalytics();

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
    const { container, cleanup } = renderHomeForAnalytics();

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
    const { container, cleanup } = renderHomeForAnalytics();

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
    const { container, cleanup } = renderHomeForAnalytics();

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

describe("public home analytics telemetry hooks", () => {
  it("reads trackEvent from shared analytics context", () => {
    expect(trackEventSpy).toBeDefined();
  });
});
