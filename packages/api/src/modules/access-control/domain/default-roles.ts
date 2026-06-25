import type { RolePermissionEntry } from "./entities/Role.js";
import { PermissionAction } from "./enums/PermissionAction.js";
import { PermissionModule } from "./enums/PermissionModule.js";

export interface DefaultRoleTemplate {
  key: string;
  name: string;
  description: string;
  isSystem: boolean;
  fullAccess: boolean;
  viewAll: boolean;
  permissions: RolePermissionEntry[];
}

function all(module: PermissionModule): RolePermissionEntry[] {
  return [
    { module, action: PermissionAction.View },
    { module, action: PermissionAction.Create },
    { module, action: PermissionAction.Edit },
    { module, action: PermissionAction.Approve },
  ];
}

function view(module: PermissionModule): RolePermissionEntry {
  return { module, action: PermissionAction.View };
}

// Operador: full control of orders + can view associates.
const operatorPermissions: RolePermissionEntry[] = [
  ...all(PermissionModule.Orders),
  view(PermissionModule.Associates),
];

// Administrador: everything the others have plus catalog and settings — full
// control of every current module.
const adminPermissions: RolePermissionEntry[] = [
  ...all(PermissionModule.Orders),
  ...all(PermissionModule.Associates),
  ...all(PermissionModule.Products),
  ...all(PermissionModule.Inventory),
  ...all(PermissionModule.Documents),
  ...all(PermissionModule.Settings),
  ...all(PermissionModule.Access),
];

// Diretoria: view-everything (current modules made explicit; `viewAll` also
// covers any future module).
const directorsPermissions: RolePermissionEntry[] = [
  view(PermissionModule.Orders),
  view(PermissionModule.Associates),
  view(PermissionModule.Products),
  view(PermissionModule.Inventory),
  view(PermissionModule.Documents),
  view(PermissionModule.Settings),
  view(PermissionModule.Access),
];

/**
 * The default, editable access roles seeded per organization. They are
 * suggestions the organization can fine-tune by toggling each permission.
 */
export const DEFAULT_ROLE_TEMPLATES: DefaultRoleTemplate[] = [
  {
    key: "OPERATOR",
    name: "Operador",
    description: "Atendimento e fila de pedidos.",
    isSystem: true,
    fullAccess: false,
    viewAll: false,
    permissions: operatorPermissions,
  },
  {
    key: "ANALYST",
    name: "Analista",
    description: "Tudo do operador, com foco em análise e aprovações.",
    isSystem: true,
    fullAccess: false,
    viewAll: false,
    permissions: operatorPermissions,
  },
  {
    key: "ADMIN",
    name: "Administrador",
    description: "Tudo dos demais perfis, mais catálogo e configurações.",
    isSystem: true,
    fullAccess: false,
    viewAll: false,
    permissions: adminPermissions,
  },
  {
    key: "DIRECTORS",
    name: "Diretoria",
    description: "Visualiza tudo, sempre.",
    isSystem: true,
    fullAccess: false,
    viewAll: true,
    permissions: directorsPermissions,
  },
];

/** The super-admin role: total access to everything, current and future. */
export const SUPER_ADMIN_ROLE_TEMPLATE: DefaultRoleTemplate = {
  key: "SUPER_ADMIN",
  name: "Super administrador",
  description: "Acesso total a tudo, incluindo módulos futuros.",
  isSystem: true,
  fullAccess: true,
  viewAll: true,
  permissions: [],
};
