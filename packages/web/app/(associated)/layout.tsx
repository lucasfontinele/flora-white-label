import { redirect } from "next/navigation";
import { AssociatedShell } from "./associated-shell";
import { MemberAccountProvider } from "@/components/associated/member-account-context";
import { PatientProvider } from "@/components/associated/patient-context";
import { ScenarioProvider } from "@/components/associated/scenario-context";
import { landingPathForSession } from "@/lib/auth-redirects";
import { getFloraSession, sessionHasAuth } from "@/lib/session";

export default async function AssociatedLayout({ children }: { children: React.ReactNode }) {
  const session = await getFloraSession();

  if (!sessionHasAuth(session)) {
    redirect("/entrar");
  }

  if (session.context?.view !== "PatientPortal") {
    redirect(landingPathForSession(session));
  }

  return (
    <ScenarioProvider>
      <MemberAccountProvider>
        <PatientProvider>
          <AssociatedShell>{children}</AssociatedShell>
        </PatientProvider>
      </MemberAccountProvider>
    </ScenarioProvider>
  );
}
