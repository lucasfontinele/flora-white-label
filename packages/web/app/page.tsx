import { redirect } from "next/navigation";
import { landingPathForSession } from "@/lib/auth-redirects";
import { getFloraSession, sessionHasAuth } from "@/lib/session";

export default async function HomePage() {
  const session = await getFloraSession();
  if (sessionHasAuth(session)) {
    redirect(landingPathForSession(session));
  }

  redirect("/entrar");
}
