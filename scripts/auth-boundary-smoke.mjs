#!/usr/bin/env node

function getArgValue(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (match) {
    return match.slice(prefix.length);
  }
  return undefined;
}

const BASE_URL =
  process.env.AUTH_BOUNDARY_BASE_URL ||
  getArgValue("base-url") ||
  getArgValue("api");

const FRONTEND_ORIGIN =
  process.env.AUTH_BOUNDARY_FRONTEND_ORIGIN ||
  getArgValue("frontend-origin") ||
  "https://quiz-arena.com";

if (!BASE_URL) {
  console.error("[auth-boundary-smoke] ERROR: AUTH_BOUNDARY_BASE_URL is required.");
  console.error(
    "Provide either AUTH_BOUNDARY_BASE_URL env var or --base-url / --api argument."
  );
  console.error(
    "Examples:\n- AUTH_BOUNDARY_BASE_URL=https://api.quiz-arena.com npm run auth:boundary:smoke\n- npm run auth:boundary:smoke -- --base-url=https://api.quiz-arena.com --frontend-origin=https://quiz-arena.com"
  );
  process.exit(1);
}

const normalizedBaseUrl = BASE_URL.replace(/\/+$/, "");

const ENDPOINTS = {
  session: "/admin/auth/session",
  login: "/admin/auth/login",
  verify2FA: "/admin/auth/2fa/verify",
  users: "/admin/users",
};

const findings = [];

function addFinding(id, status, message, severity, details = null) {
  findings.push({ id, status, message, severity, details });
}

async function requestJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    let body = null;

    if (contentType.includes("application/json")) {
      body = await response.json().catch(() => null);
    }

    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

function headersToMap(headers) {
  const map = {};
  for (const [name, value] of headers.entries()) {
    map[name.toLowerCase()] = value;
  }
  return map;
}

function hasToken(headerValue, token) {
  return headerValue
    .split(",")
    .map((tokenValue) => tokenValue.trim().toLowerCase())
    .includes(token.toLowerCase());
}

async function runPreflight(url, expectedRoute) {
  const route = `${normalizedBaseUrl}${url}`;
  const { response } = await requestJson(route, {
    method: "OPTIONS",
    headers: {
      Origin: FRONTEND_ORIGIN,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers":
        "content-type, x-requested-with, x-csrf-token, x-request-id, x-client-context, x-client-origin",
      "Cache-Control": "no-cache",
    },
  }).catch((error) => ({
    response: { status: -1, headers: new Headers(), __error: error },
    body: null,
  }));

  if (response.__error) {
    addFinding(
      `preflight:${expectedRoute}`,
      "fail",
      `${expectedRoute} preflight failed: ${response.__error.message}`,
      "high",
    );
    return;
  }

  const h = headersToMap(response.headers);
  const allowOrigin = h["access-control-allow-origin"] || "";
  const allowCredentials = (h["access-control-allow-credentials"] || "").toLowerCase();
  const allowMethods = (h["access-control-allow-methods"] || "").toLowerCase();
  const allowHeaders = (h["access-control-allow-headers"] || "").toLowerCase();

  addFinding(
    `preflight:${expectedRoute}:status`,
    response.status >= 200 && response.status < 400 ? "pass" : "fail",
    `${expectedRoute} OPTIONS status = ${response.status}`,
    response.status >= 200 && response.status < 400 ? "low" : "high",
  );

  addFinding(
    `preflight:${expectedRoute}:origin`,
    allowOrigin === FRONTEND_ORIGIN,
    `${expectedRoute} allow-origin = ${allowOrigin || "(missing)"}`,
    allowOrigin === FRONTEND_ORIGIN ? "low" : "high",
    { expected: FRONTEND_ORIGIN, actual: allowOrigin },
  );

  addFinding(
    `preflight:${expectedRoute}:credentials`,
    allowCredentials === "true" && allowOrigin !== "*",
    `${expectedRoute} allow-credentials = ${allowCredentials || "(missing)"}`,
    allowCredentials === "true" && allowOrigin !== "*" ? "low" : "high",
  );

  addFinding(
    `preflight:${expectedRoute}:methods`,
    allowMethods.includes("post"),
    `${expectedRoute} allow-methods = ${allowMethods || "(missing)"}`,
    allowMethods.includes("post") ? "low" : "high",
  );

  const required = ["content-type", "x-requested-with", "x-csrf-token", "x-request-id", "x-client-context", "x-client-origin"];
  const missing = required.filter((token) => !hasToken(allowHeaders, token));

  addFinding(
    `preflight:${expectedRoute}:headers`,
    missing.length === 0,
    `${expectedRoute} allow-headers = ${allowHeaders || "(missing)"}`,
    missing.length === 0 ? "low" : "high",
    { missing },
  );
}

async function runSessionCheck() {
  const { response, body } = await requestJson(`${normalizedBaseUrl}${ENDPOINTS.session}`, {
    method: "GET",
    headers: {
      Origin: FRONTEND_ORIGIN,
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-Client-Context": "frontend-smoke",
      "X-Client-Origin": FRONTEND_ORIGIN,
    },
  }).catch((error) => ({
    response: { status: -1, headers: new Headers(), __error: error },
    body: null,
  }));

  if (response.__error) {
    addFinding(
      "session-check",
      "fail",
      `Session endpoint failed: ${response.__error.message}`,
      "high",
    );
    return;
  }

  addFinding(
    "session-check:status",
    response.status === 401 || response.status === 403,
    `/admin/auth/session status=${response.status}`,
    response.status === 200 ? "high" : "medium",
    { status: response.status, body },
  );

  const jsonHasEmail = Boolean(body && typeof body === "object" && typeof body.email === "string");
  addFinding(
    "session-check:payload",
    !jsonHasEmail,
    jsonHasEmail
      ? "Session endpoint unexpectedly returns email for anonymous request"
      : "Session payload does not expose email on anonymous request",
    jsonHasEmail ? "high" : "low",
  );
}

async function runLoginCallCheck() {
  const { response } = await requestJson(`${normalizedBaseUrl}${ENDPOINTS.login}`, {
    method: "POST",
    headers: {
      Origin: FRONTEND_ORIGIN,
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-Client-Context": "frontend-smoke",
      "X-Client-Origin": FRONTEND_ORIGIN,
      "X-CSRF-Token": "__smoke_invalid_token__",
    },
    body: JSON.stringify({ email: "smoke-smoke@test.invalid", password: "WrongPassword123!" }),
  }).catch((error) => ({
    response: { status: -1, headers: new Headers(), __error: error },
  }));

  if (response.__error) {
    addFinding(
      "login-call",
      "fail",
      `Login call failed: ${response.__error.message}`,
      "high",
    );
    return;
  }

  addFinding(
    "login-call:status",
    [400, 401, 403, 429, 422, 200].includes(response.status),
    `/admin/auth/login status=${response.status}`,
    response.status >= 500 ? "high" : "medium",
  );

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const hasSecure = /\bSecure\b/i.test(setCookie);
    const hasHttpOnly = /\bHttpOnly\b/i.test(setCookie);
    const hasSameSite = /\bSameSite=(Lax|Strict|None)\b/i.test(setCookie);

    addFinding(
      "login-call:cookie-flags",
      hasSecure && hasHttpOnly && hasSameSite,
      `Login set-cookie found: ${setCookie}`,
      hasSecure && hasHttpOnly && hasSameSite ? "medium" : "high",
      { hasSecure, hasHttpOnly, hasSameSite },
    );
  }

  const acAllowOrigin = response.headers.get("access-control-allow-origin");
  addFinding(
    "login-call:cors-echo",
    !acAllowOrigin || acAllowOrigin === FRONTEND_ORIGIN,
    `Login Access-Control-Allow-Origin = ${acAllowOrigin || "(missing)"}`,
    acAllowOrigin && acAllowOrigin !== FRONTEND_ORIGIN ? "high" : "low",
  );
}

async function runRateLimitProbe() {
  const statuses = [];
  for (let i = 0; i < 8; i += 1) {
    const request = await requestJson(`${normalizedBaseUrl}${ENDPOINTS.login}`, {
      method: "POST",
      headers: {
        Origin: FRONTEND_ORIGIN,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-Client-Context": "frontend-smoke",
        "X-Client-Origin": FRONTEND_ORIGIN,
      },
      body: JSON.stringify({
        email: `smoke-${i}@test.invalid`,
        password: `WrongPassword123!${i}`,
      }),
    }).catch(() => null);

    if (request) {
      statuses.push(request.response.status);
    }
  }

  const has429 = statuses.includes(429);
  addFinding(
    "rate-limit:detected",
    has429 ? "pass" : "warn",
    `Login status samples = ${statuses.join(",") || "none"}`,
    has429 ? "low" : "medium",
    { statusSamples: statuses, has429 },
  );
}

function printReport() {
  const print = (item) => {
    const status = item.status === true || item.status === "pass" ? "PASS" : item.status === "warn" ? "WARN" : "FAIL";
    const severity = item.severity || "low";
    const prefix = severity === "high" ? "🚨" : severity === "medium" ? "⚠️" : "ℹ️";
    console.log(`${prefix} [${status}] [${severity}] ${item.id}: ${item.message}`);
    if (item.details !== null && item.details !== undefined) {
      console.log(`   details: ${JSON.stringify(item.details)}`);
    }
  };

  const critical = findings.filter((item) => item.status === "fail" && item.severity === "high");

  console.log("\nAuth boundary smoke report");
  for (const item of findings) {
    print(item);
  }

  if (critical.length > 0) {
    console.error(`\nResult: FAIL (${critical.length} high-severity failures).`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nResult: PASS (${findings.length} checks complete).`);
}

(async () => {
  await runPreflight(ENDPOINTS.login, "admin-auth-login");
  await runPreflight(ENDPOINTS.verify2FA, "admin-auth-2fa");
  await runSessionCheck();
  await runLoginCallCheck();
  await runRateLimitProbe();

  printReport();
})();
