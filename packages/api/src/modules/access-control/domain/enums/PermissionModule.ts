/**
 * Operational modules that can be protected by RBAC. These mirror the backoffice
 * screens (orders, associates, products, inventory, documents, settings and the
 * access-management screen itself).
 */
export enum PermissionModule {
  Orders = "ORDERS",
  Associates = "ASSOCIATES",
  Products = "PRODUCTS",
  Inventory = "INVENTORY",
  Documents = "DOCUMENTS",
  Settings = "SETTINGS",
  Access = "ACCESS",
}

export const PERMISSION_MODULES: PermissionModule[] = [
  PermissionModule.Orders,
  PermissionModule.Associates,
  PermissionModule.Products,
  PermissionModule.Inventory,
  PermissionModule.Documents,
  PermissionModule.Settings,
  PermissionModule.Access,
];
