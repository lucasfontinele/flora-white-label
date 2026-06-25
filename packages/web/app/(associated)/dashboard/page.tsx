import { getFloraSession } from "@/lib/session";
import { AssociatedDashboard } from "./components/associated-dashboard";

export default async function AssociatedDashboardPage() {
  // The associated layout already guarantees an authenticated PatientPortal
  // session, so the org id comes straight from the auth context.
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return <AssociatedDashboard organizationId={organizationId} />;
}
