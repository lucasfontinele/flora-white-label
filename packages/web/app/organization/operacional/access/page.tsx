import { getFloraSession } from "@/lib/session";
import { ModuleGuard } from "../../permissions/module-guard";
import { AccessView } from "./components/access-view";

export default async function AccessPage() {
  // The organization layout already guarantees an authenticated Organization
  // session, so the tenant id is taken straight from the auth context.
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return (
    <ModuleGuard module="ACCESS">
      <AccessView organizationId={organizationId} />
    </ModuleGuard>
  );
}
