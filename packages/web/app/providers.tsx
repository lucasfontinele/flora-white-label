"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/http";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <QueryProvider>{children}</QueryProvider>
    </ToastProvider>
  );
}

/**
 * Owns the React Query client. A single error handler on both caches surfaces
 * the API's error `message` to the user via toast, so every failed request gets
 * consistent feedback without per-call wiring.
 */
function QueryProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const [queryClient] = useState(() => {
    function notifyError(error: unknown) {
      toast({
        variant: "error",
        title: "Algo deu errado",
        description: getApiErrorMessage(error),
      });
    }

    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          refetchOnWindowFocus: false,
        },
      },
      queryCache: new QueryCache({ onError: notifyError }),
      mutationCache: new MutationCache({ onError: notifyError }),
    });
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
