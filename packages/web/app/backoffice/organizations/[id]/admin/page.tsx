import { getFloraSession } from "@/lib/session";
import { OrganizationAdminView } from "../../components/organization-admin-view";

export default async function OrganizationAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The backoffice layout already guarantees an authenticated Master session;
  // the user id authorizes the master-only admin-invitation route.
  const session = await getFloraSession();
  const userId = session.user?.id ?? "";

  return <OrganizationAdminView organizationId={id} masterUserId={userId} />;
}
