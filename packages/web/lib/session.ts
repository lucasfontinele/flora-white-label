import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { AuthSessionDto, AuthenticatedUserDto } from "@flora/shared/authentication";

export type FloraSessionData = {
  accessToken?: string;
  accessTokenExpiresAt?: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
  session?: AuthSessionDto;
  user?: AuthenticatedUserDto;
};

const sessionPassword =
  process.env.IRON_SESSION_PASSWORD ?? "local-web-session-secret-change-me-32chars";

export const sessionOptions: SessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME ?? "flora_auth",
  password: sessionPassword,
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getFloraSession(): Promise<IronSession<FloraSessionData>> {
  return getIronSession<FloraSessionData>(await cookies(), sessionOptions);
}

export function sessionHasAuth(session: FloraSessionData) {
  return Boolean(session.accessToken && session.refreshToken && session.user && session.session);
}

export function isIsoDateExpired(value: string | undefined, skewMs = 30_000) {
  if (!value) return true;

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return true;

  return timestamp - skewMs <= Date.now();
}

export function safeSessionSummary(session: FloraSessionData) {
  if (!session.user || !session.session) return null;

  return {
    session: session.session,
    user: session.user,
  };
}
