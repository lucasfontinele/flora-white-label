import { getFloraSession } from "@/lib/session";
import { PatientApprovalDetails } from "../../components/patient-approval-details";

export default async function ApprovalDetailsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";
  const organizationUserId =
    session.context?.organizationEmployeeId ?? session.user?.id ?? "";

  return (
    <PatientApprovalDetails
      organizationId={organizationId}
      patientId={userId}
      organizationUserId={organizationUserId}
    />
  );
}
