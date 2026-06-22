import { getFloraSession } from "@/lib/session";
import { RequiredDocumentsView } from "./components/required-documents-view";

export default async function RequiredDocumentsPage() {
  // The organization layout already guarantees an authenticated Organization
  // session, so the tenant id is taken straight from the auth context.
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return <RequiredDocumentsView organizationId={organizationId} />;
}
