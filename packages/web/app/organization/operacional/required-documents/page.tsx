import { getFloraSession } from "@/lib/session";
import { ModuleGuard } from "../../permissions/module-guard";
import { RequiredDocumentsView } from "./components/required-documents-view";

export default async function RequiredDocumentsPage() {
  // The organization layout already guarantees an authenticated Organization
  // session, so the tenant id is taken straight from the auth context.
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return (
    <ModuleGuard module="DOCUMENTS">
      <RequiredDocumentsView organizationId={organizationId} />
    </ModuleGuard>
  );
}
