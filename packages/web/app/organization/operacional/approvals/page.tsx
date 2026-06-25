import { getFloraSession } from "@/lib/session";
import { ModuleGuard } from "../../permissions/module-guard";
import { ApprovalsList } from "./components/approvals-list";

export default async function ApprovalsPage() {
  const session = await getFloraSession();
  const organizationId = session.context?.organizationId ?? "";

  return (
    <ModuleGuard module="DOCUMENTS">
      <ApprovalsList organizationId={organizationId} />
    </ModuleGuard>
  );
}
