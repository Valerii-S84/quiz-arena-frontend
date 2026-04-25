export type MetricUnit = "count" | "percent" | "eur" | "stars";
export type DashboardSectionStatus = "valid" | "partial" | "invalid" | "empty";
export type DashboardCardStatus = "valid" | "invalid";

export type KpiMetric = {
  current: number;
  previous: number;
  delta_pct: number;
};

export type RevenueSeriesItem = {
  date: string;
  stars: number;
  eur: number;
};

export type UsersSeriesItem = {
  date: string;
  new_users: number;
  active_users: number;
};

export type HourlyActivityItem = {
  hour: number;
  active_users: number;
};

export type FunnelItem = {
  step: string;
  value: number;
};

export type TopProductItem = {
  product: string;
  revenue_stars: number;
};

export type AlertItem = {
  type: string;
  severity: string;
  count?: number;
  from?: number;
  to?: number;
  invalid_promo_attempts_1h?: number;
};

export type OverviewData = {
  period: "7d" | "30d" | "90d";
  generated_at: string;
  kpis: Record<string, KpiMetric>;
  revenue_series: RevenueSeriesItem[];
  users_series: UsersSeriesItem[];
  hourly_activity_series: HourlyActivityItem[];
  funnel: FunnelItem[];
  top_products: TopProductItem[];
  feature_usage: Record<string, KpiMetric>;
  alerts: AlertItem[];
};

export type ContactRequestItem = {
  id: number;
  type: "student" | "partner";
  status: "NEW" | "IN_PROGRESS" | "DONE" | "SPAM";
  name: string;
  contact: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ContactRequestsData = {
  items: ContactRequestItem[];
  total: number;
  page: number;
  pages: number;
};

export type FunnelChartItem = {
  step: string;
  step_label: string;
  value: number;
  ratio_to_previous: number | null;
};

export type TopProductChartItem = {
  product: string;
  product_label: string;
  revenue_stars: number;
};

export type DashboardMetricCard = {
  key: string;
  label: string;
  hint: string;
  unit: MetricUnit;
  metric: KpiMetric | null;
  status: DashboardCardStatus;
};

export type DashboardMetricSection = {
  status: DashboardSectionStatus;
  message: string | null;
  cards: DashboardMetricCard[];
};

export type DashboardHourlyInsights = {
  status: DashboardSectionStatus;
  message: string | null;
  series: HourlyActivityItem[];
  pointCount: number;
  missingHours: number[];
  peakWindow: HourlyActivityItem | null;
  averageUsersPerHourBucket: number | null;
  topWindows: HourlyActivityItem[];
};

export type DashboardRevenueSection = {
  status: DashboardSectionStatus;
  message: string | null;
  series: RevenueSeriesItem[];
  totalRevenueStars: number | null;
};

export type DashboardUsersSection = {
  status: DashboardSectionStatus;
  message: string | null;
  series: UsersSeriesItem[];
  averageActiveUsersPerDay: number | null;
};

export type DashboardOverviewModel = {
  generatedAtLabel: string;
  kpiSection: DashboardMetricSection;
  featureUsageSection: DashboardMetricSection;
  hourlyActivity: DashboardHourlyInsights;
  revenueSection: DashboardRevenueSection;
  usersSection: DashboardUsersSection;
  funnelSection: {
    status: DashboardSectionStatus;
    message: string | null;
    items: FunnelChartItem[];
  };
  topProductsSection: {
    status: DashboardSectionStatus;
    message: string | null;
    items: TopProductChartItem[];
  };
  alertsSection: {
    status: DashboardSectionStatus;
    message: string | null;
    alerts: AlertItem[];
  };
};
