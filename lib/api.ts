import axios, { type InternalAxiosRequestConfig, type AxiosError, type AxiosResponse } from "axios";

import { getBrowserApiBaseUrl } from "@/lib/api-config";
import { apiRoutes } from "@/lib/api-routes";
import { parseOverviewPayloadSections } from "@/lib/statistics-payload";

const REQUEST_TIMEOUT_MS = 15_000;
const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const STATE_CHANGING_METHODS = new Set(["post", "put", "patch", "delete"]);
const REQUEST_ID_HEADER = "X-Request-Id";
const CLIENT_CONTEXT_HEADER = "X-Client-Context";
const CLIENT_ORIGIN_HEADER = "X-Client-Origin";

export type ApiErrorCode =
  | "TOO_MANY_REQUESTS"
  | "AUTH_REQUIRED"
  | "AUTH_FORBIDDEN"
  | "CSRF_VALIDATION_FAILED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

type HeaderSettable = {
  set(name: string, value: string): void;
};

type ApiHeaders = InternalAxiosRequestConfig["headers"] & Record<string, string>;
type ApiClientError = AxiosError & { apiCode?: ApiErrorCode };

function buildClientRequestId(): string {
  const fallback = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return fallback;
}

function readOriginHeader(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  return window.location.origin;
}

function isStateChangingMethod(method: string | undefined): boolean {
  if (!method) {
    return false;
  }

  return STATE_CHANGING_METHODS.has(method.toLowerCase());
}

function readPublicErrorCode(responseData: unknown): ApiErrorCode | undefined {
  if (!responseData || typeof responseData !== "object") {
    return undefined;
  }

  const errorCode = (responseData as { code?: unknown }).code;
  if (errorCode === "AUTH_REQUIRED" || errorCode === "AUTH_FORBIDDEN") {
    return errorCode;
  }

  if (errorCode === "CSRF_VALIDATION_FAILED" || errorCode === "INVALID_CSRF_TOKEN") {
    return "CSRF_VALIDATION_FAILED";
  }

  return undefined;
}

export function classifyApiError(error: unknown): ApiErrorCode {
  if (!(error instanceof Object) || !("response" in error)) {
    const typed = error as AxiosError | undefined;
    if (!typed?.response) {
      return "NETWORK_ERROR";
    }
  }

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status;
  if (status === 429) {
    return "TOO_MANY_REQUESTS";
  }

  if (status === 401) {
    return "AUTH_REQUIRED";
  }

  if (status === 403) {
    return "AUTH_FORBIDDEN";
  }

  const publicCode = readPublicErrorCode(axiosError.response?.data);
  if (publicCode) {
    return publicCode;
  }

  return axiosError.response ? "UNKNOWN" : "NETWORK_ERROR";
}

function getBrowserCsrfToken(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const prefix = `${CSRF_COOKIE_NAME}=`;
  const tokens = document.cookie.split(";");

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed.startsWith(prefix)) {
      continue;
    }
    return decodeURIComponent(trimmed.substring(prefix.length));
  }

  return undefined;
}

function setHeader(headers: ApiHeaders, name: string, value: string) {
  const headerSettable = headers as HeaderSettable;
  if (typeof headerSettable.set === "function") {
    headerSettable.set(name, value);
    return headers;
  }

  headers[name] = value;
  return headers;
}

export const api = axios.create({
  baseURL: getBrowserApiBaseUrl(),
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = (config.headers ?? {}) as ApiHeaders;
  config.headers = headers;

  config.headers = setHeader(headers, "Accept", "application/json");
  config.headers = setHeader(
    headers,
    "X-Requested-With",
    "XMLHttpRequest",
  );
  config.headers = setHeader(headers, REQUEST_ID_HEADER, buildClientRequestId());
  config.headers = setHeader(headers, CLIENT_CONTEXT_HEADER, "public-web");
  config.headers = setHeader(
    headers,
    CLIENT_ORIGIN_HEADER,
    readOriginHeader(),
  );

  if (isStateChangingMethod(config.method)) {
    const csrfToken = getBrowserCsrfToken();
    if (csrfToken) {
      config.headers = setHeader(headers, CSRF_HEADER_NAME, csrfToken);
    }
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const code = classifyApiError(error);
    const apiError = error as ApiClientError;
    apiError.apiCode = code;

    if (code === "TOO_MANY_REQUESTS") {
      apiError.message = "TOO_MANY_REQUESTS";
      return Promise.reject(apiError);
    }

    if (code === "AUTH_REQUIRED") {
      apiError.message = "AUTH_REQUIRED";
      return Promise.reject(apiError);
    }

    if (code === "AUTH_FORBIDDEN") {
      apiError.message = "AUTH_FORBIDDEN";
      return Promise.reject(apiError);
    }

    if (code === "CSRF_VALIDATION_FAILED") {
      apiError.message = "CSRF_VALIDATION_FAILED";
      return Promise.reject(apiError);
    }

    return Promise.reject(apiError);
  },
);

export async function fetchOverview(period: string) {
  const { data } = await api.get(apiRoutes.admin.overview, { params: { period } });
  return parseOverviewPayloadSections(data);
}

export async function fetchEconomyPurchases() {
  const { data } = await api.get(apiRoutes.admin.economy.purchases, {
    params: { page: 1, limit: 50 },
  });
  return data;
}

export async function fetchEconomySubscriptions() {
  const { data } = await api.get(apiRoutes.admin.economy.subscriptions, {
    params: { status: "ACTIVE" },
  });
  return data;
}

export async function fetchEconomyCohorts() {
  const { data } = await api.get(apiRoutes.admin.economy.cohorts);
  return data;
}

export type UserListSortBy = "created_at" | "daily_challenge_rating";

type FetchUsersOptions = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: UserListSortBy;
};

export async function fetchUsers(options: FetchUsersOptions = {}) {
  const { page = 1, limit = 100, search = "", sortBy = "created_at" } = options;
  const { data } = await api.get(apiRoutes.admin.users, {
    params: {
      page,
      limit,
      search,
      sort_by: sortBy,
    },
  });
  return data;
}

export async function fetchPromo(status?: string, query?: string) {
  const { data } = await api.get(apiRoutes.admin.promo.list, {
    params: { page: 1, limit: 100, status, query },
  });
  return data;
}

export async function fetchPromoDetail(promoId: number, reveal = false) {
  const { data } = await api.get(apiRoutes.admin.promo.detail(promoId), {
    params: { reveal },
  });
  return data;
}

export async function fetchPromoStats(promoId: number) {
  const { data } = await api.get(apiRoutes.admin.promo.stats(promoId));
  return data;
}

export async function fetchPromoAudit(promoId: number) {
  const { data } = await api.get(apiRoutes.admin.promo.audit(promoId));
  return data;
}

export async function fetchPromoProducts() {
  const { data } = await api.get(apiRoutes.admin.promo.products);
  return data;
}

export async function fetchPromoCodeAvailability(code: string) {
  const { data } = await api.get(apiRoutes.admin.promo.checkCode, {
    params: { code },
  });
  return data;
}

export async function fetchAdminSession() {
  const { data } = await api.get(apiRoutes.admin.auth.session);
  return data;
}

export async function fetchContentHealth() {
  const { data } = await api.get(apiRoutes.admin.content);
  return data;
}

export async function fetchSystemHealth() {
  const { data } = await api.get(apiRoutes.admin.system);
  return data;
}

export async function fetchContactRequests() {
  const { data } = await api.get(apiRoutes.admin.contactRequests.list, {
    params: { page: 1, limit: 20 },
  });
  return data;
}

export async function updateContactRequestStatus(requestId: number, status: string) {
  const { data } = await api.post(apiRoutes.admin.contactRequests.updateStatus(requestId), {
    status,
  });
  return data;
}
