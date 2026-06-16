import { OrganizationShell } from "./organization-shell";

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return <OrganizationShell>{children}</OrganizationShell>;
}
