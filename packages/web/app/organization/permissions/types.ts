// Shapes for GET /organizations/:organizationId/employees/:employeeId/permissions.

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

export type RolePermission = {
  module: PermissionModule;
  action: PermissionAction;
};

export type EmployeePermissions = {
  employeeId: string;
  roleId: string | null;
  roleName: string | null;
  fullAccess: boolean;
  viewAll: boolean;
  permissions: RolePermission[];
};
