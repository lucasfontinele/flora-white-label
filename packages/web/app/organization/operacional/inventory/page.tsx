import { getFloraSession } from "@/lib/session";
import { InventoryView } from "./components/inventory-view";

export default async function InventoryPage() {
  // The organization layout already guarantees an authenticated Organization
  // session, so the tenant id and the acting user id come from the auth context.
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";
  const currentUserId = session.user?.id ?? "";

  return <InventoryView organizationId={organizationId} currentUserId={currentUserId} />;
}
