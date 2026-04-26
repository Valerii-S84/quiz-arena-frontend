import { apiRoutes } from "@/lib/api-routes";
import { getServerApiUrl } from "@/lib/api-config";
import { parsePublicStatsPayload } from "@/lib/statistics-payload";

import {
  createUnavailableStatsState,
  normalizePublicStats,
} from "./public-home-helpers";
import type { StatsState } from "./public-home-types";

export async function fetchPublicHomeServerStats(): Promise<StatsState> {
  try {
    const response = await fetch(getServerApiUrl(apiRoutes.public.stats), {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      return createUnavailableStatsState();
    }

    const payload = await response.json();
    return normalizePublicStats(parsePublicStatsPayload(payload));
  } catch {
    return createUnavailableStatsState();
  }
}
