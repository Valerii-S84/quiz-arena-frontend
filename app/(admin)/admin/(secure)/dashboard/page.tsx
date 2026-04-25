"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchContactRequests, fetchOverview, updateContactRequestStatus } from "@/lib/api";
import type { OverviewPayloadSections } from "@/lib/statistics-payload";

import { normalizeOverviewData } from "./dashboard-normalization";
import { PERIOD_OPTIONS } from "./dashboard-config";
import { DashboardContactRequestsSection } from "./dashboard-contact-requests-section";
import { DashboardOverviewSections } from "./dashboard-overview-sections";
import type { ContactRequestsData } from "./dashboard-types";

export default function DashboardPage() {
  const [period, setPeriod] = useState("7d");
  const queryClient = useQueryClient();

  const { data, error: queryError, isLoading } = useQuery<OverviewPayloadSections, Error>({
    queryKey: ["overview", period],
    queryFn: () => fetchOverview(period),
  });

  const { data: contactRequestsData, isLoading: isContactRequestsLoading } =
    useQuery<ContactRequestsData>({
      queryKey: ["contact-requests"],
      queryFn: fetchContactRequests,
    });

  const statusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: string }) =>
      updateContactRequestStatus(requestId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contact-requests"] });
    },
  });

  const overviewModel = useMemo(() => {
    if (!data) {
      return null;
    }
    return normalizeOverviewData(data);
  }, [data]);

  return (
    <main className="min-w-0 space-y-6 py-2">
      <header className="surface rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ember/60">Admin Übersicht</p>
            <h1 className="mt-1 text-3xl">Geschäftszahlen klar erklärt</h1>
            <p className="mt-2 text-sm text-ember/70">
              Alle Werte sind auf den gewählten Zeitraum bezogen und werden mit dem vorherigen
              gleich langen Zeitraum verglichen.
            </p>
            {overviewModel ? (
              <p className="mt-1 text-xs text-ember/60">
                Letzte Aktualisierung: {overviewModel.generatedAtLabel} (Berlin)
              </p>
            ) : null}
          </div>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded-xl border border-ember/20 bg-white px-3 py-2"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {isLoading ? <p className="text-sm">Dashboard-Daten werden geladen...</p> : null}

      {queryError ? (
        <section className="surface rounded-2xl border border-red-200 bg-red-50/70 p-5">
          <p className="text-sm font-medium text-red-800">
            Dashboard-Daten konnten nicht geladen oder validiert werden.
          </p>
          <p className="mt-1 text-xs text-red-700">{queryError.message}</p>
        </section>
      ) : null}

      {overviewModel ? <DashboardOverviewSections model={overviewModel} /> : null}

      <DashboardContactRequestsSection
        data={contactRequestsData}
        isLoading={isContactRequestsLoading}
        isStatusPending={statusMutation.isPending}
        activeRequestId={statusMutation.variables?.requestId ?? null}
        onStatusChange={(requestId, currentStatus, nextStatus) => {
          if (nextStatus === currentStatus) {
            return;
          }
          statusMutation.mutate({ requestId, status: nextStatus });
        }}
      />
    </main>
  );
}
