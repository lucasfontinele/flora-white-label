import type { UserType } from "@flora/shared/authentication";

export function landingPathForUserType(type: UserType) {
  if (type === "MASTER") return "/painel";
  if (type === "ORGANIZATION") return "/operacional/dashboard";

  return "/dashboard";
}
