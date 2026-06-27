"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Fires the `/me` refresh routine when the patient lands on the home. The API
 * re-evaluates the patient's registration status (expired receita / pending
 * documents ⇒ WAITING_DOCUMENTS) and the route persists the fresh context into
 * the session. If a status changed, we refresh the route tree so the gates
 * (catalog, limits) reflect it immediately. Runs once per mount; after a refresh
 * the next run reports no change, so there is no loop.
 */
export function SessionSync() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      try {
        const response = await fetch("/api/auth/me", { method: "GET" });
        if (!response.ok) return;

        const body = (await response.json()) as { changed?: boolean };
        if (body.changed) {
          router.refresh();
        }
      } catch {
        // Best-effort refresh; ignore transient failures.
      }
    })();
  }, [router]);

  return null;
}
