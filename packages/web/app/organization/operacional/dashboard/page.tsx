import { getFloraSession } from "@/lib/session";
import { DirectorsGuard } from "../../permissions/directors-guard";
import { OperationalDashboard } from "./components/operational-dashboard";

export default async function OperationalDashboardPage() {
  // The organization layout already guarantees an authenticated Organization
  // session; the tenant and the requesting employee come from the auth context.
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";
  const employeeId = session.context?.organizationEmployeeId ?? "";

  return (
    <DirectorsGuard>
      <OperationalDashboard organizationId={organizationId} employeeId={employeeId} />
    </DirectorsGuard>
  );
}
