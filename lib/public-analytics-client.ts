import { getBrowserApiUrl } from "@/lib/api-config";
import { apiRoutes } from "@/lib/api-routes";
import {
  PUBLIC_VISITOR_ID_STORAGE_KEY,
  type PublicAnalyticsPayload,
  type WebsiteAnalyticsEventType,
} from "@/lib/analytics";

type WebsiteAnalyticsPayload = {
  event_type: WebsiteAnalyticsEventType;
  visitor_id: string;
  path: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
};

type SendWebsiteAnalyticsEventInput = {
  eventType: WebsiteAnalyticsEventType;
  path?: string;
  timestamp?: string;
  metadata?: PublicAnalyticsPayload;
};

const VISITOR_ID_MIN_LENGTH = 16;
const VISITOR_ID_MAX_LENGTH = 128;
const ALLOWED_METADATA_KEYS = new Set([
  "public_event_name",
  "section",
  "cta",
  "destination",
  "question_index",
  "score",
]);

function randomFallbackId(): string {
  return `qa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

function createVisitorId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return randomFallbackId();
}

function isValidVisitorId(value: string | null): value is string {
  if (!value) {
    return false;
  }
  return value.length >= VISITOR_ID_MIN_LENGTH && value.length <= VISITOR_ID_MAX_LENGTH;
}

export function getOrCreatePublicVisitorId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(PUBLIC_VISITOR_ID_STORAGE_KEY);
  if (isValidVisitorId(storedValue)) {
    return storedValue;
  }

  const visitorId = createVisitorId();
  window.localStorage.setItem(PUBLIC_VISITOR_ID_STORAGE_KEY, visitorId);
  return visitorId;
}

function currentPath(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  return window.location.pathname || "/";
}

function safeReferrer(): string | undefined {
  if (typeof document === "undefined" || !document.referrer) {
    return undefined;
  }

  try {
    const referrer = new URL(document.referrer);
    if (referrer.protocol !== "http:" && referrer.protocol !== "https:") {
      return undefined;
    }
    return `${referrer.host}${referrer.pathname}`.slice(0, 512);
  } catch {
    return undefined;
  }
}

function readUtmParam(name: string): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const value = new URLSearchParams(window.location.search).get(name)?.trim();
  return value ? value.slice(0, 160) : undefined;
}

function sanitizeMetadata(
  metadata: PublicAnalyticsPayload | undefined,
): Record<string, string | number | boolean | null> | undefined {
  if (!metadata) {
    return undefined;
  }

  const sanitized: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (!ALLOWED_METADATA_KEYS.has(key) || value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      sanitized[key] = value.slice(0, 200);
      continue;
    }

    if (typeof value === "number" || typeof value === "boolean" || value === null) {
      sanitized[key] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function buildPayload(input: SendWebsiteAnalyticsEventInput): WebsiteAnalyticsPayload | null {
  const visitorId = getOrCreatePublicVisitorId();
  if (!visitorId) {
    return null;
  }

  return {
    event_type: input.eventType,
    visitor_id: visitorId,
    path: input.path ?? currentPath(),
    referrer: safeReferrer(),
    utm_source: readUtmParam("utm_source"),
    utm_medium: readUtmParam("utm_medium"),
    utm_campaign: readUtmParam("utm_campaign"),
    timestamp: input.timestamp ?? new Date().toISOString(),
    metadata: sanitizeMetadata(input.metadata),
  };
}

export function sendWebsiteAnalyticsEvent(input: SendWebsiteAnalyticsEventInput): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const payload = buildPayload(input);
  if (!payload) {
    return false;
  }

  const body = JSON.stringify(payload);
  const url = getBrowserApiUrl(apiRoutes.public.websiteAnalyticsEvents);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const sent = navigator.sendBeacon(
      url,
      new Blob([body], { type: "application/json" }),
    );
    if (sent) {
      return true;
    }
  }

  if (typeof fetch !== "function") {
    return false;
  }

  try {
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "omit",
    }).catch(() => undefined);
  } catch {
    return false;
  }

  return true;
}
