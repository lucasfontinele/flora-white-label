import type { AuthContextDto, AuthView } from "@flora/shared/authentication";
import type { FloraSessionData } from "./session";

export function landingPathForAuthView(view: AuthView) {
  if (view === "BackofficeMaster") return "/painel";
  if (view === "Organization") return "/operacional/dashboard";

  return "/dashboard";
}

export function landingPathForAuthContext(context: AuthContextDto) {
  return landingPathForAuthView(context.view);
}

export function landingPathForSession(session: FloraSessionData) {
  return session.context ? landingPathForAuthContext(session.context) : "/entrar";
}
