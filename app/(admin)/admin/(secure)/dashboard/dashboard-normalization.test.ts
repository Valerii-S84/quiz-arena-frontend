import { describe, expect, it } from "vitest";

import overviewFixture from "@/docs/statistics-fixtures/admin-overview-seeded-7d.json";

import { FEATURE_USAGE_DEFINITIONS, KPI_DEFINITIONS } from "./dashboard-config";
import { normalizeOverviewData } from "./dashboard-normalization";
import type { OverviewData } from "./dashboard-types";

describe("normalizeOverviewData", () => {
  it("builds a display model from a validated overview payload", () => {
    const model = normalizeOverviewData(overviewFixture as OverviewData);

    expect(model.kpiCards).toHaveLength(KPI_DEFINITIONS.length);
    expect(model.featureUsageCards).toHaveLength(FEATURE_USAGE_DEFINITIONS.length);
    expect(model.hourlyActivity.pointCount).toBe(24);
    expect(model.totalRevenueStars).toBe(
      overviewFixture.revenue_series.reduce((sum, item) => sum + item.stars, 0),
    );
    expect(model.funnelData[0]).toMatchObject({
      step: "Start",
      step_label: "Neue Nutzer",
      ratio_to_previous: 100,
    });
  });

  it("fails loudly when a configured KPI is missing", () => {
    const { dau: _dau, ...kpisWithoutDau } = overviewFixture.kpis;
    const invalidPayload = {
      ...overviewFixture,
      kpis: kpisWithoutDau,
    } as OverviewData;

    expect(() => normalizeOverviewData(invalidPayload)).toThrow("Missing kpi metric: dau");
  });
});
