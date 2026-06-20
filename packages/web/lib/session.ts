import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { AuthContextDto, AuthenticatedUserDto } from "@flora/shared/authentication";

export type FloraSessionData = {
  accessToken?: string;
  accessTokenExpiresAt?: string;
  user?: AuthenticatedUserDto;
  context?: AuthContextDto;
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
  if (!session.accessToken || !session.user || !session.context) return false;
  return !isIsoDateExpired(session.accessTokenExpiresAt);
}

export function isIsoDateExpired(value: string | undefined, skewMs = 30_000) {
  if (!value) return true;

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return true;

  return timestamp - skewMs <= Date.now();
}

export function safeSessionSummary(session: FloraSessionData) {
  if (!session.user || !session.context) return null;

  return {
    context: session.context,
    user: session.user,
  };
}

export function getJwtExpiresAt(token: string): string | undefined {
  const [, payload] = token.split(".");
  if (!payload) return undefined;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(Buffer.from(normalizedPayload, "base64").toString("utf8")) as {
      exp?: unknown;
    };

    return typeof decoded.exp === "number" ? new Date(decoded.exp * 1000).toISOString() : undefined;
  } catch {
    return undefined;
  }
}
