import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getBrowserApiUrl, getServerApiUrl } from "@/lib/api-config";
import { apiRoutes } from "@/lib/api-routes";

const navItems = [
  { href: "/admin/dashboard", label: "Übersicht" },
  { href: "/admin/economy", label: "Umsatz" },
  { href: "/admin/users", label: "Nutzer" },
  { href: "/admin/promo", label: "Promo" },
  { href: "/admin/content", label: "Inhalte" },
  { href: "/admin/system", label: "System" },
];

type AdminSessionPayload = {
  email?: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function ensureSession() {
  const cookieHeader = cookies().toString();
  const timeoutMs = 3000;
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetch(getServerApiUrl(apiRoutes.admin.auth.session), {
      headers: {
        cookie: cookieHeader,
        accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-Client-Context": "secure-admin-server-layout",
      },
      cache: "no-store",
      signal: abortController.signal,
    });

    if (!response.ok) {
      redirect("/admin/login");
    }

    const payload = (await response.json().catch(() => null)) as AdminSessionPayload | null;
    if (!payload || !isNonEmptyString(payload.email)) {
      redirect("/admin/login");
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function SecureAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await ensureSession();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 overflow-x-hidden px-4 py-6 lg:flex-row lg:items-start lg:px-6">
      <aside className="surface h-fit w-full rounded-2xl p-4 lg:sticky lg:top-6 lg:w-64">
        <p className="text-xs uppercase tracking-[0.2em] text-ember/60">Admin Bereich</p>
        <p className="mt-2 text-lg">{session.email}</p>
        <nav className="mt-4 space-y-2 text-sm">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="block rounded-lg px-3 py-2 hover:bg-ember/5">
              {item.label}
            </a>
          ))}
        </nav>
        <form action={getBrowserApiUrl(apiRoutes.admin.auth.logout)} method="post" className="mt-6">
          <button className="w-full rounded-lg border border-ember/20 px-3 py-2 text-left text-sm">
            Abmelden
          </button>
        </form>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
