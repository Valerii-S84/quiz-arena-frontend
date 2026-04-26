"use client";

import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  type PublicAnalyticsEventName,
  type PublicAnalyticsPayload,
  type QueuedPublicAnalyticsEvent,
} from "@/lib/analytics";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type AnalyticsConsent = "pending" | "granted" | "denied";

type AnalyticsContextValue = {
  consent: AnalyticsConsent;
  requestConsent: (value: boolean) => void;
  trackEvent: (name: PublicAnalyticsEventName, payload?: PublicAnalyticsPayload) => void;
};

const MAX_QUEUED_EVENTS = 40;

const AnalyticsContext = createContext<AnalyticsContextValue>({
  consent: "pending",
  requestConsent: () => {},
  trackEvent: () => {},
});

type AnalyticsProviderProps = {
  children: ReactNode;
};

type WindowWithAnalytics = Window & {
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: (...args: unknown[]) => void;
  __quizArenaPublicAnalytics?: Array<Record<string, unknown>>;
};

function normalizeConsentValue(value: string | null): AnalyticsConsent {
  if (value === "granted" || value === "denied") {
    return value;
  }

  return "pending";
}

function buildBaseEventPayload(name: PublicAnalyticsEventName, payload: PublicAnalyticsPayload) {
  return {
    ...payload,
    event_name: name,
    event_category: "public",
  };
}

type PageEventContext = {
  page_path: string;
  page_title: string;
  timestamp: string;
};

function getPageContext(timestamp = new Date().toISOString()): PageEventContext {
  return {
    page_path: window.location.pathname,
    page_title: document.title,
    timestamp,
  };
}

function emitToWindow(
  name: PublicAnalyticsEventName,
  payload: PublicAnalyticsPayload,
  context?: PageEventContext,
) {
  if (typeof window === "undefined") {
    return;
  }

  const eventPayload = buildBaseEventPayload(name, payload);
  const eventWindow = window as WindowWithAnalytics;
  const eventContext = context ?? getPageContext();

  eventWindow.__quizArenaPublicAnalytics = eventWindow.__quizArenaPublicAnalytics ?? [];
  eventWindow.__quizArenaPublicAnalytics.push({
    ...eventPayload,
    ...eventContext,
  });

  if (eventWindow.dataLayer) {
    eventWindow.dataLayer.push({ event: name, ...eventPayload });
  }

  eventWindow.dispatchEvent?.(
    new CustomEvent("quiz-arena-analytics-event", {
      detail: eventPayload,
    }),
  );
}

export function usePublicAnalytics() {
  return useContext(AnalyticsContext);
}

function ConsentNotice({
  onAccept,
  onReject,
}: {
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <section
      className="fixed inset-x-0 bottom-0 z-[80] bg-white p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.18)]"
      role="dialog"
      aria-live="polite"
      aria-label="Datenschutz und Analytics-Einwilligung"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm text-slate-800">
          Wir messen Basis-Interaktionen nur nach deinem Einverständnis zur Verbesserung von
          Conversion und Content.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Analytics erlauben
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold"
          >
            Nicht jetzt
          </button>
        </div>
      </div>
    </section>
  );
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const isPublicScope = !pathname?.startsWith("/admin");
  const [consent, setConsent] = useState<AnalyticsConsent>("pending");
  const [isLoaded, setIsLoaded] = useState(false);
  const [queuedEvents, setQueuedEvents] = useState<QueuedPublicAnalyticsEvent[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !isPublicScope) {
      return;
    }

    const storedValue = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    setConsent(normalizeConsentValue(storedValue));
    setIsLoaded(true);
  }, [isPublicScope]);

  const requestConsent = useCallback((isAllowed: boolean) => {
    if (typeof window === "undefined") {
      return;
    }

    const nextState: AnalyticsConsent = isAllowed ? "granted" : "denied";
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, nextState);
    setConsent(nextState);
  }, []);

  const flushEvents = useCallback(() => {
    if (consent !== "granted") {
      return;
    }

    setQueuedEvents((events) => {
      events.forEach((queuedEvent) => {
        emitToWindow(queuedEvent.name, queuedEvent.payload, {
          page_path: queuedEvent.page_path,
          page_title: queuedEvent.page_title,
          timestamp: queuedEvent.timestamp,
        });
      });
      return [];
    });
  }, [consent]);

  const trackEvent = useCallback(
    (name: PublicAnalyticsEventName, payload: PublicAnalyticsPayload = {}) => {
      if (consent === "pending") {
        setQueuedEvents((events) => {
          const context = getPageContext();
          const nextEvent: QueuedPublicAnalyticsEvent = {
            name,
            payload,
            timestamp: context.timestamp,
            page_path: context.page_path,
            page_title: context.page_title,
          };

          const mergedEvents = [...events, nextEvent];
          if (mergedEvents.length <= MAX_QUEUED_EVENTS) {
            return mergedEvents;
          }

          return mergedEvents.slice(mergedEvents.length - MAX_QUEUED_EVENTS);
        });
        return;
      }

      if (consent === "denied") {
        return;
      }

      emitToWindow(name, payload);
    },
    [consent],
  );

  useEffect(() => {
    if (consent === "denied") {
      setQueuedEvents([]);
    }

    if (consent === "granted") {
      flushEvents();
    }
  }, [consent, flushEvents]);

  const value = useMemo(
    () => ({
      consent,
      requestConsent,
      trackEvent,
    }),
    [consent, requestConsent, trackEvent],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
      {isPublicScope && isLoaded && consent === "pending" ? (
        <ConsentNotice
          onAccept={() => requestConsent(true)}
          onReject={() => requestConsent(false)}
        />
      ) : null}
    </AnalyticsContext.Provider>
  );
}
