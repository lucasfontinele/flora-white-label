import { MasterShell } from "./master-shell";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return <MasterShell>{children}</MasterShell>;
}
