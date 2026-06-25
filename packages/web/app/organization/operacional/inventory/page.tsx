import { getFloraSession } from "@/lib/session";
import { ModuleGuard } from "../../permissions/module-guard";
import { InventoryView } from "./components/inventory-view";

export default async function InventoryPage() {
  // The organization layout already guarantees an authenticated Organization
  // session, so the tenant id and the acting user id come from the auth context.
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";
  const currentUserId = session.user?.id ?? "";

  return (
    <ModuleGuard module="INVENTORY">
      <InventoryView organizationId={organizationId} currentUserId={currentUserId} />
    </ModuleGuard>
  );
}
