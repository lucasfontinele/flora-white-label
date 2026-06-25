import { getFloraSession } from "@/lib/session";
import { ModuleGuard } from "../../../permissions/module-guard";
import { OrderDetailView } from "../components/order-detail-view";

export default async function OperationalOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  // The organization layout already guarantees an authenticated Organization
  // session, so the tenant id is taken straight from the auth context.
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return (
    <ModuleGuard module="ORDERS">
      <OrderDetailView organizationId={organizationId} orderId={orderId} />
    </ModuleGuard>
  );
}
