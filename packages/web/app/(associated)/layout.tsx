import { AssociatedShell } from "./associated-shell";
import { MemberAccountProvider } from "@/components/associated/member-account-context";
import { PatientProvider } from "@/components/associated/patient-context";

export default function AssociatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemberAccountProvider>
      <PatientProvider>
        <AssociatedShell>{children}</AssociatedShell>
      </PatientProvider>
    </MemberAccountProvider>
  );
}
