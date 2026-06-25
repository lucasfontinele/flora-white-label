import { getFloraSession } from "@/lib/session";
import { MasterDashboard } from "./components/master-dashboard";

export default async function MasterDashboardPage() {
  // The backoffice layout already guarantees an authenticated Master session;
  // the user id authorizes the master-only reports route.
  const session = await getFloraSession();
  const userId = session.user?.id ?? "";

  return <MasterDashboard userId={userId} />;
}
