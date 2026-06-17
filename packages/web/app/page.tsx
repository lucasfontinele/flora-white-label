import { redirect } from "next/navigation";
import { landingPathForUserType } from "@/lib/auth-redirects";
import { getFloraSession, isIsoDateExpired, sessionHasAuth } from "@/lib/session";

export default async function HomePage() {
  const session = await getFloraSession();
  const { user } = session;

  // Authenticated (refresh token still valid) → send to the user's home by type.
  if (user && sessionHasAuth(session) && !isIsoDateExpired(session.refreshTokenExpiresAt)) {
    redirect(landingPathForUserType(user.type));
  }

  redirect("/entrar");
}
