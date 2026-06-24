import { getFloraSession } from "@/lib/session";
import { OrdersView } from "./components/orders-view";

export default async function OperationalOrdersPage() {
  // The organization layout already guarantees an authenticated Organization
  // session, so the tenant id is taken straight from the auth context.
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return <OrdersView organizationId={organizationId} />;
}
