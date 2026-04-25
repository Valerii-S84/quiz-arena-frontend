"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_STYLE,
} from "./dashboard-config";
import {
  deltaClassName,
  formatDelta,
  formatHourLabel,
  formatHourRangeLabel,
  formatShortDateLabel,
  formatValue,
  mapAlert,
} from "./dashboard-helpers";
import type { AlertItem, DashboardOverviewModel } from "./dashboard-types";

type DashboardOverviewSectionsProps = {
  model: DashboardOverviewModel;
};

function DashboardKpiSection({ model }: DashboardOverviewSectionsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {model.kpiCards.map((card) => {
        const { metric } = card;
        return (
          <article key={card.key} className="surface rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-ember/60">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatValue(metric.current, card.unit)}
            </p>
            <p className={`mt-1 text-xs ${deltaClassName(metric.delta_pct)}`}>
              Veränderung: {formatDelta(metric.delta_pct)}
            </p>
            <p className="mt-1 text-xs text-ember/60">
              Vorher: {formatValue(metric.previous, card.unit)}
            </p>
            <p className="mt-2 text-xs text-ember/70">{card.hint}</p>
          </article>
        );
      })}
    </section>
  );
}

function DashboardFeatureUsageSection({ model }: DashboardOverviewSectionsProps) {
  return (
    <section className="surface rounded-2xl p-4">
      <h2 className="text-xl">Nutzung wichtiger Funktionen</h2>
      <p className="mt-1 text-sm text-ember/70">
        Diese Werte zeigen direkt, ob zentrale Features wirklich genutzt werden.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {model.featureUsageCards.map((card) => {
          const { metric } = card;
          return (
            <article
              key={card.key}
              className="rounded-xl border border-ember/15 bg-white/70 p-3"
            >
              <p className="text-xs uppercase tracking-wide text-ember/60">{card.label}</p>
              <p className="mt-1 text-xl font-semibold">
                {formatValue(metric.current, card.unit)}
              </p>
              <p className={`mt-1 text-xs ${deltaClassName(metric.delta_pct)}`}>
                Veränderung: {formatDelta(metric.delta_pct)}
              </p>
              <p className="mt-2 text-xs text-ember/70">{card.hint}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DashboardActivitySection({
  model,
}: DashboardOverviewSectionsProps) {
  const { hourlyActivity } = model;

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.62fr)]">
      <article className="surface overflow-hidden rounded-[32px] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ember/45">
              Aktivitaet
            </p>
            <h2 className="mt-1 text-2xl">Aktive Nutzer nach Berliner Stunde</h2>
            <p className="mt-1 text-sm text-ember/70">
              Zeigt distinct aktive Nutzer je Berliner Stundenfenster im gewählten Zeitraum.
            </p>
          </div>
          <div className="rounded-full border border-ember/15 bg-white/80 px-3 py-1 text-xs text-ember/75">
            Berlin-Zeit · {hourlyActivity.pointCount} Stundenfenster
          </div>
        </div>
        <div className="mt-4 h-[24rem] rounded-[26px] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(41,80,101,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(137,245,199,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(242,247,249,0.98))] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyActivity.series}
              margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dashboardHourlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#295065" stopOpacity={0.96} />
                  <stop offset="100%" stopColor="#89f5c7" stopOpacity={0.84} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={CHART_GRID_STROKE}
                strokeDasharray="4 8"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                tick={CHART_AXIS_TICK}
                tickFormatter={formatHourLabel}
                axisLine={false}
                tickLine={false}
                minTickGap={12}
              />
              <YAxis
                tick={CHART_AXIS_TICK}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(41, 80, 101, 0.06)" }}
                contentStyle={CHART_TOOLTIP_STYLE}
                labelFormatter={(value) => `${formatHourLabel(Number(value))} Uhr`}
                formatter={(value) => [
                  `${Number(value).toLocaleString("de-DE")} Nutzer`,
                  "Aktiv",
                ]}
              />
              <Bar
                dataKey="active_users"
                name="Aktiv"
                fill="url(#dashboardHourlyGradient)"
                radius={[12, 12, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="surface rounded-[32px] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ember/45">
          Stunden-Insights
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-[24px] border border-[#295065]/12 bg-[linear-gradient(135deg,rgba(41,80,101,0.12),rgba(137,245,199,0.18))] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ember/50">Peak</p>
            <p className="mt-2 text-2xl font-semibold text-[#1f4257]">
              {hourlyActivity.peakWindow
                ? formatHourRangeLabel(hourlyActivity.peakWindow.hour)
                : "Keine Daten"}
            </p>
            <p className="mt-1 text-sm text-ember/70">
              {hourlyActivity.peakWindow
                ? `${hourlyActivity.peakWindow.active_users.toLocaleString("de-DE")} aktive Nutzer im staerksten Stundenfenster`
                : "Im gewählten Zeitraum wurden noch keine Stundenwerte erfasst."}
            </p>
          </div>

          <div className="rounded-[24px] border border-ember/12 bg-[#fff9f3] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ember/50">
              Ø je Stundenfenster
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#1f4257]">
              {hourlyActivity.averageUsersPerHourBucket.toLocaleString("de-DE", {
                maximumFractionDigits: 1,
              })}
            </p>
            <p className="mt-1 text-sm text-ember/70">
              Durchschnitt distinct aktiver Nutzer je Berliner Stundenfenster im gewählten Zeitraum.
            </p>
          </div>

          <div className="rounded-[24px] border border-ember/12 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ember/50">Top-Zeitfenster</p>
            <div className="mt-3 space-y-2">
              {hourlyActivity.topWindows.length > 0 ? (
                hourlyActivity.topWindows.map((item) => (
                  <div
                    key={item.hour}
                    className="flex items-center justify-between rounded-2xl border border-ember/10 bg-[#fffdf9] px-3 py-2"
                  >
                    <span className="text-sm font-medium text-[#1f4257]">
                      {formatHourRangeLabel(item.hour)}
                    </span>
                    <span className="rounded-full bg-[#1f4257] px-2.5 py-1 text-xs font-semibold text-white">
                      {item.active_users.toLocaleString("de-DE")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ember/65">Noch keine Aktivitaetsdaten.</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function DashboardRevenueUsersSection({
  model,
}: DashboardOverviewSectionsProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="surface overflow-hidden rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl">Tagesumsatz (⭐)</h2>
            <p className="mt-1 text-sm text-ember/70">
              Umsatzkurve als sekundäre Geschäftssicht neben dem Aktivitätsprofil.
            </p>
          </div>
          <div className="rounded-full border border-ember/15 bg-white/80 px-3 py-1 text-xs text-ember/75">
            Gesamt: {model.totalRevenueStars.toLocaleString("de-DE")} ⭐
          </div>
        </div>
        <div className="mt-4 h-[22rem] rounded-2xl border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(137,245,199,0.22),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,244,0.96))] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={model.revenueSeries}
              margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dashboardRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#89f5c7" stopOpacity={0.75} />
                  <stop offset="100%" stopColor="#89f5c7" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="4 8" vertical={false} />
              <XAxis
                dataKey="date"
                tick={CHART_AXIS_TICK}
                tickFormatter={formatShortDateLabel}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ stroke: "#295065", strokeDasharray: "4 6", strokeOpacity: 0.35 }}
                contentStyle={CHART_TOOLTIP_STYLE}
                labelFormatter={(value) => formatShortDateLabel(String(value))}
                formatter={(value) => [`${Number(value).toLocaleString("de-DE")} ⭐`, "Umsatz"]}
              />
              <Area
                type="monotone"
                dataKey="stars"
                stroke="#295065"
                strokeWidth={3}
                fill="url(#dashboardRevenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="surface overflow-hidden rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl">Neue vs. aktive Nutzer</h2>
            <p className="mt-1 text-sm text-ember/70">
              Besser lesbarer Vergleich zwischen Wachstum und echter Nutzung.
            </p>
          </div>
          <div className="rounded-full border border-ember/15 bg-white/80 px-3 py-1 text-xs text-ember/75">
            Ø aktiv pro Tag:{" "}
            {model.averageActiveUsersPerDay.toLocaleString("de-DE", { maximumFractionDigits: 1 })}
          </div>
        </div>
        <div className="mt-4 h-[22rem] rounded-2xl border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(245,141,116,0.16),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,244,241,0.98))] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={model.usersSeries}
              margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
            >
              <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="4 8" vertical={false} />
              <XAxis
                dataKey="date"
                tick={CHART_AXIS_TICK}
                tickFormatter={formatShortDateLabel}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ stroke: "#f58d74", strokeDasharray: "4 6", strokeOpacity: 0.28 }}
                contentStyle={CHART_TOOLTIP_STYLE}
                labelFormatter={(value) => formatShortDateLabel(String(value))}
              />
              <Line dataKey="new_users" name="Neu" stroke="#f58d74" strokeWidth={3} dot={false} />
              <Line
                dataKey="active_users"
                name="Aktiv"
                stroke="#295065"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

function DashboardFunnelProductsSection({
  model,
}: DashboardOverviewSectionsProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="surface overflow-hidden rounded-3xl p-5">
        <div>
          <h2 className="text-xl">Zeitfenster-Milestones</h2>
          <p className="mt-1 text-sm text-ember/70">
            Vergleich derselben Zeitraum-Meilensteine; kein cohort-basierter Conversion-Funnel.
          </p>
        </div>
        <div className="mt-4 h-[22rem] rounded-2xl border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(137,245,199,0.20),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,248,245,0.98))] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={model.funnelData}
              layout="vertical"
              margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dashboardFunnelGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#89f5c7" stopOpacity={0.98} />
                  <stop offset="100%" stopColor="#295065" stopOpacity={0.88} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="4 8" horizontal={false} />
              <XAxis
                type="number"
                tick={CHART_AXIS_TICK}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="step_label"
                width={130}
                tick={CHART_AXIS_TICK}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="url(#dashboardFunnelGradient)" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 space-y-1 text-xs text-ember/75">
          {model.funnelData.map((item, index) => (
            <p key={`${item.step}-${index}`}>
              {item.step_label}: {item.value.toLocaleString("de-DE")} Nutzer
              {index > 0
                ? ` · ${item.ratio_to_previous.toLocaleString("de-DE", {
                    maximumFractionDigits: 1,
                  })}% relativ zur vorherigen Stufe im selben Zeitraum`
                : ""}
            </p>
          ))}
        </div>
      </article>

      <article className="surface overflow-hidden rounded-3xl p-5">
        <div>
          <h2 className="text-xl">Top-Produkte (⭐ Umsatz)</h2>
          <p className="mt-1 text-sm text-ember/70">
            Horizontaler Vergleich, damit Produktnamen nicht mehr gequetscht wirken.
          </p>
        </div>
        <div className="mt-4 h-[22rem] rounded-2xl border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(245,141,116,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(251,245,242,0.98))] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={model.topProductsData}
              layout="vertical"
              margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dashboardProductsGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f58d74" stopOpacity={0.98} />
                  <stop offset="100%" stopColor="#e6bc77" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="4 8" horizontal={false} />
              <XAxis
                type="number"
                tick={CHART_AXIS_TICK}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                dataKey="product_label"
                type="category"
                width={132}
                tick={CHART_AXIS_TICK}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(value) => [`${Number(value).toLocaleString("de-DE")} ⭐`, "Umsatz"]}
              />
              <Bar dataKey="revenue_stars" fill="url(#dashboardProductsGradient)" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

function DashboardAlertsSection({ alerts }: { alerts: AlertItem[] }) {
  return (
    <section className="surface rounded-2xl p-4">
      <h2 className="text-xl">Warnungen</h2>
      <div className="mt-3 space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-emerald-700">Aktuell keine kritischen Warnungen.</p>
        ) : null}
        {alerts.map((alert, index) => {
          const mapped = mapAlert(alert);
          return (
            <article
              key={`${alert.type}-${index}`}
              className="rounded-lg border border-ember/15 bg-white/70 px-3 py-2 text-sm"
            >
              <p className="font-medium text-ember">{mapped.title}</p>
              <p className="mt-1 text-ember/80">{mapped.details}</p>
              <p className="mt-1 text-xs text-ember/65">{mapped.action}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function DashboardOverviewSections({ model }: DashboardOverviewSectionsProps) {
  return (
    <>
      <DashboardKpiSection model={model} />
      <DashboardFeatureUsageSection model={model} />
      <DashboardActivitySection model={model} />
      <DashboardRevenueUsersSection model={model} />
      <DashboardFunnelProductsSection model={model} />
      <DashboardAlertsSection alerts={model.alerts} />
    </>
  );
}
