import { z, type ZodIssue } from "zod";

import type { StatsPayload } from "@/app/(public)/public-home-types";
import type { OverviewData } from "@/app/(admin)/admin/(secure)/dashboard/dashboard-types";

const nonNegativeIntegerSchema = z.number().int().nonnegative();
const nonNegativeNumberSchema = z.number().finite().nonnegative();
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoDateTimeSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Expected ISO datetime string",
});

const kpiMetricSchema = z
  .object({
    current: nonNegativeNumberSchema,
    previous: nonNegativeNumberSchema,
    delta_pct: z.number().finite(),
  })
  .passthrough();

const revenueSeriesItemSchema = z
  .object({
    date: isoDateSchema,
    stars: nonNegativeIntegerSchema,
    eur: nonNegativeNumberSchema,
  })
  .passthrough();

const usersSeriesItemSchema = z
  .object({
    date: isoDateSchema,
    new_users: nonNegativeIntegerSchema,
    active_users: nonNegativeIntegerSchema,
  })
  .passthrough();

const hourlyActivityItemSchema = z
  .object({
    hour: z.number().int().min(0).max(23),
    active_users: nonNegativeIntegerSchema,
  })
  .passthrough();

const hourlyActivitySeriesSchema = z
  .array(hourlyActivityItemSchema)
  .length(24)
  .superRefine((series, context) => {
    series.forEach((item, index) => {
      if (item.hour !== index) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Expected hourly bucket ${index}, received ${item.hour}`,
          path: [index, "hour"],
        });
      }
    });
  });

const funnelSchema = z.tuple([
  z.object({ step: z.literal("Start"), value: nonNegativeIntegerSchema }).passthrough(),
  z.object({ step: z.literal("First Quiz"), value: nonNegativeIntegerSchema }).passthrough(),
  z.object({ step: z.literal("Streak 3+"), value: nonNegativeIntegerSchema }).passthrough(),
  z.object({ step: z.literal("Purchase"), value: nonNegativeIntegerSchema }).passthrough(),
]);

const topProductSchema = z
  .object({
    product: z.string().min(1),
    revenue_stars: nonNegativeIntegerSchema,
  })
  .passthrough();

const alertSchema = z
  .object({
    type: z.string().min(1),
    severity: z.string().min(1),
    count: nonNegativeIntegerSchema.optional(),
    from: nonNegativeNumberSchema.optional(),
    to: nonNegativeNumberSchema.optional(),
    invalid_promo_attempts_1h: nonNegativeIntegerSchema.optional(),
  })
  .passthrough();

const overviewKpisSchema = z
  .object({
    dau: kpiMetricSchema,
    wau: kpiMetricSchema,
    mau: kpiMetricSchema,
    new_users: kpiMetricSchema,
    revenue_stars: kpiMetricSchema,
    revenue_eur: kpiMetricSchema,
    active_subscriptions: kpiMetricSchema,
    retention_d1: kpiMetricSchema,
    retention_d7: kpiMetricSchema,
    start_users: kpiMetricSchema,
    conversion_start_to_quiz: kpiMetricSchema,
    conversion_quiz_to_purchase: kpiMetricSchema,
  })
  .passthrough();

const featureUsageSchema = z
  .object({
    duel_created_users: kpiMetricSchema,
    duel_completed_users: kpiMetricSchema,
    duel_completion_rate: kpiMetricSchema,
    referral_shared_users: kpiMetricSchema,
    referral_referrers_started: kpiMetricSchema,
    daily_cup_registered_users: kpiMetricSchema,
  })
  .passthrough();

const publicStatsSchema = z
  .object({
    users: nonNegativeIntegerSchema,
    quizzes: nonNegativeIntegerSchema,
  })
  .passthrough();

const overviewPayloadSchema = z
  .object({
    period: z.enum(["7d", "30d", "90d"]),
    generated_at: isoDateTimeSchema,
    kpis: overviewKpisSchema,
    revenue_series: z.array(revenueSeriesItemSchema),
    users_series: z.array(usersSeriesItemSchema),
    hourly_activity_series: hourlyActivitySeriesSchema,
    funnel: funnelSchema,
    top_products: z.array(topProductSchema).max(5),
    feature_usage: featureUsageSchema,
    alerts: z.array(alertSchema),
  })
  .passthrough();

export class StatisticsPayloadError extends Error {
  readonly issues: ZodIssue[];
  readonly route: string;

  constructor(route: string, issues: ZodIssue[]) {
    super(`Invalid statistics payload for ${route}`);
    this.name = "StatisticsPayloadError";
    this.route = route;
    this.issues = issues;
  }
}

export function parsePublicStatsPayload(payload: unknown): StatsPayload {
  const result = publicStatsSchema.safeParse(payload);
  if (!result.success) {
    throw new StatisticsPayloadError("/stats", result.error.issues);
  }
  return result.data as StatsPayload;
}

export function parseOverviewPayload(payload: unknown): OverviewData {
  const result = overviewPayloadSchema.safeParse(payload);
  if (!result.success) {
    throw new StatisticsPayloadError("/admin/overview", result.error.issues);
  }
  return result.data as OverviewData;
}
