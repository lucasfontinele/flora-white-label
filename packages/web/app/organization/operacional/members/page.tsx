import { getFloraSession } from "@/lib/session";
import { AssociatesView } from "./components/associates-view";

export default async function MembersPage() {
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return <AssociatesView organizationId={organizationId} />;
}
