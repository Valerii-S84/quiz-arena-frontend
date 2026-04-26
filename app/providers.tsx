"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { AnalyticsProvider } from "./analytics-provider";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <AnalyticsProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AnalyticsProvider>
  );
}
