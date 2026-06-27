import { getFloraSession } from "@/lib/session";
import { CatalogView } from "./components/catalog-view";

export default async function CatalogPage() {
  // The associated layout guarantees an authenticated PatientPortal session, so
  // the organization comes from the auth context; the selected patient comes
  // from the client-side PatientProvider (usePatientSelection).
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return <CatalogView organizationId={organizationId} />;
}
