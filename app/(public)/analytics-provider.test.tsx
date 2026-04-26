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
  const analyticsWindow = window as Window & AnalyticsWindowShape;
  analyticsWindow.__quizArenaPublicAnalytics = analyticsWindow.__quizArenaPublicAnalytics ?? [];
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  return analyticsWindow;
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

  return <button type="button" onClick={() => trackEvent("hero_cta_click", { source: "probe" })}>track</button>;
}

afterEach(() => {
  document.body.innerHTML = "";
  document.title = "";
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

function ContextTrackingProbe() {
  const { trackEvent } = usePublicAnalytics();

  return (
    <div>
      <button
        type="button"
        onClick={() => trackEvent("hero_cta_click", { marker: "first" })}
      >
        track first
      </button>
      <button
        type="button"
        onClick={() => trackEvent("hero_cta_click", { marker: "second" })}
      >
        track second
      </button>
    </div>
  );
}

function DuplicateMarkerProbe() {
  const { trackEvent } = usePublicAnalytics();

  return (
    <div>
      <button
        type="button"
        onClick={() => trackEvent("hero_cta_click", { marker: "duplicate", sequence: 1 })}
      >
        track duplicate 1
      </button>
      <button
        type="button"
        onClick={() => trackEvent("hero_cta_click", { marker: "duplicate", sequence: 2 })}
      >
        track duplicate 2
      </button>
    </div>
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
    window.history.pushState({}, "", "/");
    document.title = "Homepage";
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

      window.history.pushState({}, "", "/contact");
      document.title = "Kontakt";

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
      expect(
        (analyticsWindow.__quizArenaPublicAnalytics?.[0] as { page_title: string }).page_title,
      ).toBe("Homepage");
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

  it("does not collapse multiple queued events with same marker", async () => {
    mockUsePathname.mockReturnValue("/");
    const { container, cleanup } = renderInContainer(
      <AnalyticsProvider>
        <DuplicateMarkerProbe />
      </AnalyticsProvider>,
    );

    try {
      window.history.pushState({}, "", "/");
      document.title = "Homepage";

      const firstButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "track duplicate 1",
      );
      const secondButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "track duplicate 2",
      );
      expect(firstButton).not.toBeNull();
      expect(secondButton).not.toBeNull();

      act(() => {
        firstButton?.click();
      });

      window.history.pushState({}, "", "/projects");
      document.title = "Projects";

      act(() => {
        secondButton?.click();
      });

      const duplicates = window.__quizArenaPublicAnalytics ?? [];
      expect(duplicates).toHaveLength(0);

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
      const duplicatedEvents = analyticsWindow.__quizArenaPublicAnalytics.filter(
        (event) => event.marker === "duplicate",
      ) as Array<{ page_path: string; page_title: string; sequence: number }>;

      expect(duplicatedEvents).toHaveLength(2);
      expect(duplicatedEvents?.[0]?.sequence).toBe(1);
      expect(duplicatedEvents?.[1]?.sequence).toBe(2);
      expect(duplicatedEvents?.[0]).toMatchObject({ page_path: "/", page_title: "Homepage" });
      expect(duplicatedEvents?.[1]).toMatchObject({
        page_path: "/projects",
        page_title: "Projects",
      });
    } finally {
      cleanup();
    }
  });

  it("preserves per-event page context when multiple pending events are queued across routes", async () => {
    mockUsePathname.mockReturnValue("/");
    const { container, cleanup } = renderInContainer(
      <AnalyticsProvider>
        <ContextTrackingProbe />
      </AnalyticsProvider>,
    );

    try {
      window.history.pushState({}, "", "/");
      document.title = "Homepage";

      const firstButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "track first",
      );
      const secondButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "track second",
      );
      expect(firstButton).not.toBeNull();
      expect(secondButton).not.toBeNull();

      act(() => {
        firstButton?.click();
      });

      window.history.pushState({}, "", "/projects");
      document.title = "Projects";

      act(() => {
        secondButton?.click();
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
      expect(analyticsWindow.__quizArenaPublicAnalytics).toHaveLength(2);

      const firstEvent = analyticsWindow.__quizArenaPublicAnalytics.find(
        (event) => event.marker === "first",
      ) as { page_path: string; page_title: string };
      const secondEvent = analyticsWindow.__quizArenaPublicAnalytics.find(
        (event) => event.marker === "second",
      ) as { page_path: string; page_title: string };

      expect(firstEvent).toMatchObject({ page_path: "/", page_title: "Homepage" });
      expect(secondEvent).toMatchObject({ page_path: "/projects", page_title: "Projects" });
    } finally {
      cleanup();
    }
  });

  it("stores event timestamps at capture time while consent is pending", async () => {
    vi.useFakeTimers();
    const firstTimestamp = new Date("2026-04-27T10:00:00.000Z");
    const secondTimestamp = new Date("2026-04-27T10:00:10.000Z");
    const flushTimestamp = new Date("2026-04-27T10:05:00.000Z");
    const { container, cleanup } = renderInContainer(
      <AnalyticsProvider>
        <ContextTrackingProbe />
      </AnalyticsProvider>,
    );

    try {
      mockUsePathname.mockReturnValue("/");
      const firstButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "track first",
      );
      const secondButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "track second",
      );

      expect(firstButton).not.toBeNull();
      expect(secondButton).not.toBeNull();

      vi.setSystemTime(firstTimestamp);
      window.history.pushState({}, "", "/");
      document.title = "Homepage";
      act(() => {
        firstButton?.click();
      });

      vi.setSystemTime(secondTimestamp);
      window.history.pushState({}, "", "/projects");
      document.title = "Projects";
      act(() => {
        secondButton?.click();
      });

      vi.setSystemTime(flushTimestamp);
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
      const firstEvent = analyticsWindow.__quizArenaPublicAnalytics.find(
        (event) => event.marker === "first",
      ) as { timestamp: string };
      const secondEvent = analyticsWindow.__quizArenaPublicAnalytics.find(
        (event) => event.marker === "second",
      ) as { timestamp: string };

      expect(firstEvent.timestamp).toBe(firstTimestamp.toISOString());
      expect(secondEvent.timestamp).toBe(secondTimestamp.toISOString());
    } finally {
      vi.useRealTimers();
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
