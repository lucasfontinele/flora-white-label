import { redirect } from "next/navigation";
import { OrganizationShell } from "./organization-shell";
import { landingPathForSession } from "@/lib/auth-redirects";
import { getFloraSession, sessionHasAuth } from "@/lib/session";

export default async function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const session = await getFloraSession();

  if (!sessionHasAuth(session)) {
    redirect("/entrar");
  }

  if (session.context?.view !== "Organization") {
    redirect(landingPathForSession(session));
  }

  return <OrganizationShell>{children}</OrganizationShell>;
}
