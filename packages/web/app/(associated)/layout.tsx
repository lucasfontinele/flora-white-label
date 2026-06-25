import { redirect } from "next/navigation";
import { AssociatedShell } from "./associated-shell";
import { derivePatientProfiles } from "@/components/associated/derive-patient-profiles";
import { MemberAccountProvider } from "@/components/associated/member-account-context";
import { PatientProvider } from "@/components/associated/patient-context";
import { landingPathForSession } from "@/lib/auth-redirects";
import { getFloraSession, sessionHasAuth } from "@/lib/session";

export default async function AssociatedLayout({ children }: { children: React.ReactNode }) {
  const session = await getFloraSession();

  if (!sessionHasAuth(session)) {
    redirect("/entrar");
  }

  if (!session.user || !session.context) {
    redirect("/entrar");
  }

  if (session.context.view !== "PatientPortal") {
    redirect(landingPathForSession(session));
  }

  const fallbackName = session.context.guardian?.name ?? session.user.email;
  const { patients, defaultPatientId } = derivePatientProfiles(session.context, fallbackName);

  return (
    <MemberAccountProvider>
      <PatientProvider patients={patients} defaultPatientId={defaultPatientId}>
        <AssociatedShell user={session.user} context={session.context}>
          {children}
        </AssociatedShell>
      </PatientProvider>
    </MemberAccountProvider>
  );
}
