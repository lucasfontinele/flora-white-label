import { getFloraSession } from "@/lib/session";
import { ApprovalsList } from "./components/approvals-list";

export default async function ApprovalsPage() {
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return <ApprovalsList organizationId={organizationId} />;
}
