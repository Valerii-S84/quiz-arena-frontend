export const ANALYTICS_CONSENT_STORAGE_KEY = "quiz_arena_public_analytics_consent_v1";

export type PublicAnalyticsEventName =
  | "hero_cta_click"
  | "channel_cta_click"
  | "wizard_open"
  | "lead_submit_success";

export type PublicAnalyticsPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

export type QueuedPublicAnalyticsEvent = {
  name: PublicAnalyticsEventName;
  payload: PublicAnalyticsPayload;
  timestamp: string;
  page_path: string;
  page_title: string;
};
