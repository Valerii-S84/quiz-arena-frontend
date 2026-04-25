import { describe, expect, it } from "vitest";

import emptyOverviewFixture from "@/docs/statistics-fixtures/admin-overview-empty-7d.json";
import overviewFixture from "@/docs/statistics-fixtures/admin-overview-seeded-7d.json";
import publicStatsFixture from "@/docs/statistics-fixtures/public-stats-seeded.json";

import {
  parseOverviewPayload,
  parsePublicStatsPayload,
  StatisticsPayloadError,
} from "./statistics-payload";

describe("statistics payload parsing", () => {
  it("accepts the seeded public stats fixture", () => {
    expect(parsePublicStatsPayload(publicStatsFixture)).toEqual(publicStatsFixture);
  });

  it("rejects invalid public stats values", () => {
    expect(() =>
      parsePublicStatsPayload({
        users: "1",
        quizzes: 1,
      }),
    ).toThrow(StatisticsPayloadError);
  });

  it("accepts the seeded overview fixture", () => {
    expect(parseOverviewPayload(overviewFixture)).toEqual(overviewFixture);
  });

  it("accepts the empty overview fixture with 24 hourly buckets", () => {
    const parsed = parseOverviewPayload(emptyOverviewFixture);
    expect(parsed.hourly_activity_series).toHaveLength(24);
    expect(parsed.funnel).toHaveLength(4);
  });

  it("rejects overview payloads with missing required KPI keys", () => {
    const { dau: _dau, ...kpisWithoutDau } = overviewFixture.kpis;
    const invalidPayload = {
      ...overviewFixture,
      kpis: kpisWithoutDau,
    };

    expect(() => parseOverviewPayload(invalidPayload)).toThrow(StatisticsPayloadError);
  });

  it("rejects overview payloads with broken hourly bucket coverage", () => {
    const invalidPayload = structuredClone(overviewFixture);

    invalidPayload.hourly_activity_series = invalidPayload.hourly_activity_series.slice(1);

    expect(() => parseOverviewPayload(invalidPayload)).toThrow(StatisticsPayloadError);
  });
});
