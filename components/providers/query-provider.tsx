"use client";

import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from "@tanstack/react-query";
import { useState } from "react";

const queryDefaults: DefaultOptions["queries"] = {
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: true,
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: queryDefaults,
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

