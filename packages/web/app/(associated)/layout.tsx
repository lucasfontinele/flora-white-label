import { AssociatedShell } from "./associated-shell";
import { PatientProvider } from "@/components/associated/patient-context";

export default function AssociatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientProvider>
      <AssociatedShell>{children}</AssociatedShell>
    </PatientProvider>
  );
}
