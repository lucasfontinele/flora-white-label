import { getFloraSession } from "@/lib/session";
import { ModuleGuard } from "../../permissions/module-guard";
import { AssociatesView } from "./components/associates-view";

export default async function MembersPage() {
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return (
    <ModuleGuard module="ASSOCIATES">
      <AssociatesView organizationId={organizationId} />
    </ModuleGuard>
  );
}
