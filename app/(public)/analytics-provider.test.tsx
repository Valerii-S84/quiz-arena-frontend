/* @vitest-environment jsdom */

import { type ReactElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AnalyticsProvider, usePublicAnalytics } from "@/app/analytics-provider";

type AnalyticsWindowShape = {
  __quizArenaPublicAnalytics: Array<Record<string, unknown>>;
  dataLayer: Array<Record<string, unknown>>;
};

declare global {
  interface Window {
    __quizArenaPublicAnalytics?: Array<Record<string, unknown>>;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const windowAnalytics = (): AnalyticsWindowShape => {
  window.__quizArenaPublicAnalytics ||= [];
  window.dataLayer ||= [];
  return {
    __quizArenaPublicAnalytics: window.__quizArenaPublicAnalytics,
    dataLayer: window.dataLayer,
  };
};

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
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

function AnalyticsProbe() {
  const { trackEvent } = usePublicAnalytics();

  return (
    <button type="button" onClick={() => trackEvent("hero_cta_click", { source: "probe" })}>
      track
    </button>
  );
}

afterEach(() => {
  document.body.innerHTML = "";
  const analyticsWindow = windowAnalytics();
  analyticsWindow.__quizArenaPublicAnalytics = [];
  analyticsWindow.dataLayer = [];
  window.localStorage.removeItem("quiz_arena_public_analytics_consent_v1");
  mockUsePathname.mockReset();
  mockUsePathname.mockReturnValue("/");
  vi.clearAllMocks();
});

function QueueProbe({ count }: { count: number }) {
  const { trackEvent } = usePublicAnalytics();

  return (
    <button
      type="button"
      onClick={() => {
        for (let i = 0; i < count; i += 1) {
          trackEvent("hero_cta_click", { sequence: i });
        }
      }}
    >
      track many
    </button>
  );
}

describe("public analytics consent and event queue", () => {
  it("tracks events instantly when consent is already granted before mount", async () => {
    window.localStorage.setItem("quiz_arena_public_analytics_consent_v1", "granted");

    const receivedEvents: Array<Record<string, unknown>> = [];
    const onAnalyticsEvent = (event: Event) => {
      receivedEvents.push((event as CustomEvent).detail as Record<string, unknown>);
    };
    window.addEventListener("quiz-arena-analytics-event", onAnalyticsEvent);

    const { container, cleanup } = renderInContainer(
      <AnalyticsProvider>
        <AnalyticsProbe />
      </AnalyticsProvider>,
    );

    try {
      const trackButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "track",
      );
      expect(trackButton).not.toBeNull();

      act(() => {
        trackButton?.click();
      });
      await act(async () => {
        await Promise.resolve();
      });

      const consentNotice = container.querySelector('[aria-label="Datenschutz und Analytics-Einwilligung"]');
      expect(consentNotice).toBeNull();

      const analyticsWindow = windowAnalytics();
      expect(analyticsWindow.__quizArenaPublicAnalytics).toHaveLength(1);
      expect(analyticsWindow.__quizArenaPublicAnalytics?.[0]).toMatchObject({
        event_name: "hero_cta_click",
        event_category: "public",
      });
      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0]).toMatchObject({
        event_name: "hero_cta_click",
        event_category: "public",
        source: "probe",
      });
    } finally {
      window.removeEventListener("quiz-arena-analytics-event", onAnalyticsEvent);
      cleanup();
    }
  });

  it("queues event while consent is pending and flushes after accepting", async () => {
    mockUsePathname.mockReturnValue("/");
    const { container, cleanup } = renderInContainer(
      <AnalyticsProvider>
        <AnalyticsProbe />
      </AnalyticsProvider>,
    );

    try {
      const trackButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "track",
      );
      expect(trackButton).not.toBeNull();
      act(() => {
        trackButton?.click();
      });

      expect(window.__quizArenaPublicAnalytics).toHaveLength(0);
      expect(window.localStorage.getItem("quiz_arena_public_analytics_consent_v1")).toBeNull();

      const acceptButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "Analytics erlauben",
      );
      expect(acceptButton).not.toBeNull();

      act(() => {
        acceptButton?.click();
      });

      expect(window.localStorage.getItem("quiz_arena_public_analytics_consent_v1")).toBe("granted");

      await act(async () => {
        await Promise.resolve();
      });

      const analyticsWindow = windowAnalytics();
      expect(analyticsWindow.__quizArenaPublicAnalytics).toHaveLength(1);
      expect(analyticsWindow.__quizArenaPublicAnalytics?.[0]?.event_name).toBe("hero_cta_click");
      expect(analyticsWindow.__quizArenaPublicAnalytics?.[0]?.source).toBe("probe");
      expect((analyticsWindow.__quizArenaPublicAnalytics?.[0] as { page_path: string }).page_path).toBe("/");
    } finally {
      cleanup();
    }
  });

  it("keeps events dropped when user denied analytics consent", async () => {
    mockUsePathname.mockReturnValue("/");
    const { container, cleanup } = renderInContainer(
      <AnalyticsProvider>
        <AnalyticsProbe />
      </AnalyticsProvider>,
    );

    try {
      const trackButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "track",
      );
      expect(trackButton).not.toBeNull();
      act(() => {
        trackButton?.click();
      });

      const rejectButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "Nicht jetzt",
      );
      expect(rejectButton).not.toBeNull();

      act(() => {
        rejectButton?.click();
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(window.localStorage.getItem("quiz_arena_public_analytics_consent_v1")).toBe("denied");
      const deniedAnalyticsWindow = windowAnalytics();
      expect(deniedAnalyticsWindow.__quizArenaPublicAnalytics).toHaveLength(0);

      const consentNotice = container.querySelector('[aria-label="Datenschutz und Analytics-Einwilligung"]');
      expect(consentNotice).toBeNull();
    } finally {
      cleanup();
    }
  });

  it("caps queued events to MAX_QUEUED_EVENTS and flushes only the latest events", async () => {
    mockUsePathname.mockReturnValue("/");
    const { container, cleanup } = renderInContainer(
      <AnalyticsProvider>
        <QueueProbe count={50} />
      </AnalyticsProvider>,
    );

    try {
      const trackManyButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "track many",
      );
      expect(trackManyButton).not.toBeNull();

      act(() => {
        trackManyButton?.click();
      });

      const acceptButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "Analytics erlauben",
      );
      expect(acceptButton).not.toBeNull();

      act(() => {
        acceptButton?.click();
      });

      await act(async () => {
        await Promise.resolve();
      });

      const analyticsWindow = windowAnalytics();
      expect(analyticsWindow.__quizArenaPublicAnalytics).toHaveLength(40);
      expect(analyticsWindow.__quizArenaPublicAnalytics?.[0]?.sequence).toBe(10);
      expect(analyticsWindow.__quizArenaPublicAnalytics?.[39]?.sequence).toBe(49);
    } finally {
      cleanup();
    }
  });

  it("does not display consent notice on admin routes", () => {
    mockUsePathname.mockReturnValue("/admin/dashboard");
    const { container, cleanup } = renderInContainer(
      <AnalyticsProvider>
        <AnalyticsProbe />
      </AnalyticsProvider>,
    );

    try {
      const consentNotice = container.querySelector('[aria-label="Datenschutz und Analytics-Einwilligung"]');
      expect(consentNotice).toBeNull();
    } finally {
      cleanup();
    }
  });
});
