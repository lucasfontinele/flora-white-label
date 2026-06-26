import { getFloraSession } from "@/lib/session";
import { LimitsView } from "./components/limits-view";

export default async function LimitsPage() {
  // The associated layout guarantees an authenticated PatientPortal session, so
  // the organization comes straight from the auth context. The selected patient
  // comes from the client-side PatientProvider (usePatientSelection).
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return <LimitsView organizationId={organizationId} />;
}
