import { redirect } from "next/navigation";
import { MasterShell } from "./master-shell";
import { landingPathForSession } from "@/lib/auth-redirects";
import { getFloraSession, sessionHasAuth } from "@/lib/session";

export default async function MasterLayout({ children }: { children: React.ReactNode }) {
  const session = await getFloraSession();

  if (!sessionHasAuth(session)) {
    redirect("/entrar");
  }

  if (session.context?.view !== "BackofficeMaster") {
    redirect(landingPathForSession(session));
  }

  return <MasterShell>{children}</MasterShell>;
}
