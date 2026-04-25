import { FEATURE_USAGE_DEFINITIONS, KPI_DEFINITIONS } from "./dashboard-config";
import { findPeakHourlyActivity, mapFunnelStep, mapProductLabel } from "./dashboard-helpers";
import type {
  DashboardMetricCard,
  DashboardOverviewModel,
  FunnelChartItem,
  KpiMetric,
  MetricUnit,
  OverviewData,
  TopProductChartItem,
} from "./dashboard-types";

type MetricDefinition = {
  key: string;
  label: string;
  hint: string;
  unit: MetricUnit;
};

function requireMetric(
  metrics: Record<string, KpiMetric>,
  key: string,
  groupLabel: string,
): KpiMetric {
  const metric = metrics[key];
  if (!metric) {
    throw new Error(`Missing ${groupLabel} metric: ${key}`);
  }
  return metric;
}

function buildMetricCards(
  metrics: Record<string, KpiMetric>,
  definitions: readonly MetricDefinition[],
  groupLabel: string,
): DashboardMetricCard[] {
  return definitions.map((definition) => ({
    key: definition.key,
    label: definition.label,
    hint: definition.hint,
    unit: definition.unit,
    metric: requireMetric(metrics, definition.key, groupLabel),
  }));
}

function buildFunnelData(data: OverviewData): FunnelChartItem[] {
  return data.funnel.map((item, index) => {
    const previousValue = index > 0 ? data.funnel[index - 1]?.value ?? 0 : 0;
    const ratioToPrevious =
      index === 0 ? 100 : previousValue > 0 ? (item.value / previousValue) * 100 : 0;

    return {
      step: item.step,
      step_label: mapFunnelStep(item.step),
      value: item.value,
      ratio_to_previous: ratioToPrevious,
    };
  });
}

function buildTopProductsData(data: OverviewData): TopProductChartItem[] {
  return data.top_products.map((item) => ({
    product: item.product,
    product_label: mapProductLabel(item.product),
    revenue_stars: item.revenue_stars,
  }));
}

export function normalizeOverviewData(data: OverviewData): DashboardOverviewModel {
  const hourlyActivitySeries = data.hourly_activity_series;
  const totalRevenueStars = data.revenue_series.reduce((sum, item) => sum + item.stars, 0);
  const averageActiveUsersPerDay =
    data.users_series.length > 0
      ? data.users_series.reduce((sum, item) => sum + item.active_users, 0) / data.users_series.length
      : 0;
  const averageUsersPerHourBucket =
    hourlyActivitySeries.length > 0
      ? hourlyActivitySeries.reduce((sum, item) => sum + item.active_users, 0) /
        hourlyActivitySeries.length
      : 0;

  return {
    generatedAtLabel: new Date(data.generated_at).toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
    }),
    kpiCards: buildMetricCards(data.kpis, KPI_DEFINITIONS, "kpi"),
    featureUsageCards: buildMetricCards(data.feature_usage, FEATURE_USAGE_DEFINITIONS, "feature usage"),
    revenueSeries: data.revenue_series,
    usersSeries: data.users_series,
    hourlyActivity: {
      series: hourlyActivitySeries,
      pointCount: hourlyActivitySeries.length,
      peakWindow: findPeakHourlyActivity(hourlyActivitySeries),
      averageUsersPerHourBucket,
      topWindows: [...hourlyActivitySeries]
        .filter((item) => item.active_users > 0)
        .sort((left, right) => right.active_users - left.active_users)
        .slice(0, 3),
    },
    funnelData: buildFunnelData(data),
    topProductsData: buildTopProductsData(data),
    totalRevenueStars,
    averageActiveUsersPerDay,
    alerts: data.alerts,
  };
}
