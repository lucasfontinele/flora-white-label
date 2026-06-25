// Shapes and enums for the /organizations/:organizationId/roles and
// /organizations/:organizationId/employee-invitations endpoints.
// Mirrors the API access-control + invitation contracts.

import type { IconName } from "@/components/ui/icon";

export const PERMISSION_MODULES = [
  "ORDERS",
  "ASSOCIATES",
  "PRODUCTS",
  "INVENTORY",
  "DOCUMENTS",
  "SETTINGS",
  "ACCESS",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = ["VIEW", "CREATE", "EDIT", "APPROVE"] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const MODULE_LABELS: Record<PermissionModule, string> = {
  ORDERS: "Pedidos",
  ASSOCIATES: "Associados",
  PRODUCTS: "Catálogo e produtos",
  INVENTORY: "Estoque",
  DOCUMENTS: "Documentos",
  SETTINGS: "Configurações",
  ACCESS: "Gestão de acessos",
};

export const ACTION_LABELS: Record<PermissionAction, string> = {
  VIEW: "Ver",
  CREATE: "Criar",
  EDIT: "Editar",
  APPROVE: "Aprovar",
};

export const ROLE_ICONS: Record<string, IconName> = {
  OPERATOR: "user",
  ANALYST: "clipboard-check",
  ADMIN: "sliders",
  DIRECTORS: "bar-chart-3",
  SUPER_ADMIN: "shield-check",
};

export type RolePermission = {
  module: PermissionModule;
  action: PermissionAction;
};

export type Role = {
  id: string;
  organizationId: string;
  key: string | null;
  name: string;
  description: string | null;
  isSystem: boolean;
  fullAccess: boolean;
  viewAll: boolean;
  permissions: RolePermission[];
  membersCount: number;
};

export type PermissionCatalog = {
  modules: PermissionModule[];
  actions: PermissionAction[];
};

// GET /organizations/:organizationId/roles
export type RolesResponse = {
  data: Role[];
  catalog: PermissionCatalog;
};

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceito",
  EXPIRED: "Expirado",
  REVOKED: "Cancelado",
};

export type Invitation = {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  roleName: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

// GET /organizations/:organizationId/employee-invitations
export type InvitationsResponse = {
  data: Invitation[];
};

export type SendInvitationBody = {
  email: string;
  roleId: string;
};

export function permissionKey(module: PermissionModule, action: PermissionAction): string {
  return `${module}:${action}`;
}
