import type { CurrentSessionResponse, RefreshSessionResponse } from "@flora/shared/authentication";
import { getFloraSession, isIsoDateExpired, safeSessionSummary, sessionHasAuth } from "@/lib/session";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export async function GET() {
  const session = await getFloraSession();

  if (!sessionHasAuth(session)) {
    return Response.json({ error: { message: "Sessão ausente." } }, { status: 401 });
  }

  if (isIsoDateExpired(session.accessTokenExpiresAt)) {
    const refreshed = await refreshSession(session.refreshToken!);

    if (!refreshed) {
      session.destroy();
      return Response.json({ error: { message: "Sessão inválida." } }, { status: 401 });
    }

    session.accessToken = refreshed.data.tokens.accessToken;
    session.accessTokenExpiresAt = refreshed.data.tokens.accessTokenExpiresAt;
    session.refreshToken = refreshed.data.tokens.refreshToken;
    session.refreshTokenExpiresAt = refreshed.data.tokens.refreshTokenExpiresAt;
    session.session = refreshed.data.session;
    session.user = refreshed.data.user;
    await session.save();

    return Response.json({ data: safeSessionSummary(session) });
  }

  const current = await fetch(new URL("/auth/me", apiBaseUrl), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    method: "GET",
  });

  if (!current.ok) {
    session.destroy();
    return Response.json({ error: { message: "Sessão inválida." } }, { status: 401 });
  }

  const body = (await current.json()) as CurrentSessionResponse;
  session.session = body.data.session;
  session.user = body.data.user;
  await session.save();

  return Response.json({ data: body.data });
}

async function refreshSession(refreshToken: string): Promise<RefreshSessionResponse | null> {
  const response = await fetch(new URL("/auth/refresh", apiBaseUrl), {
    body: JSON.stringify({ refreshToken }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) return null;

  return response.json() as Promise<RefreshSessionResponse>;
}
