import { getFloraSession } from "@/lib/session";
import { DocumentsView } from "./components/documents-view";

export default async function DocumentsPage() {
  // The associated layout already guarantees an authenticated PatientPortal
  // session, so org + patient identity come straight from the auth context.
  const session = await getFloraSession();
  const context = session.context;

  const organizationId = context?.organizationId ?? "";
  const managedPatients = context?.managedPatients ?? [];
  const patients =
    managedPatients.length > 0
      ? managedPatients.map((patient) => ({ id: patient.id, name: patient.name }))
      : context?.patient
        ? [{ id: context.patient.id, name: context.patient.name }]
        : [];
  const defaultPatientId = context?.patientId ?? patients[0]?.id ?? "";

  return (
    <DocumentsView
      organizationId={organizationId}
      patients={patients}
      defaultPatientId={defaultPatientId}
    />
  );
}
