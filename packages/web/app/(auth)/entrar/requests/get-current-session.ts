import type { AuthSessionDto, AuthenticatedUserDto } from "@flora/shared/authentication";

export type WebCurrentSession = {
  session: AuthSessionDto;
  user: AuthenticatedUserDto;
};

export async function getCurrentSession(): Promise<WebCurrentSession | null> {
  const response = await fetch("/api/auth/session", {
    headers: {
      Accept: "application/json",
    },
    method: "GET",
  });

  if (response.status === 401) return null;

  const body = (await response.json()) as { data?: WebCurrentSession };
  return body.data ?? null;
}
