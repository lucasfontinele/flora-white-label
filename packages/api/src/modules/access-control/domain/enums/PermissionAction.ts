/**
 * Actions that can be granted per module: view, create, edit and approve.
 */
export enum PermissionAction {
  View = "VIEW",
  Create = "CREATE",
  Edit = "EDIT",
  Approve = "APPROVE",
}

export const PERMISSION_ACTIONS: PermissionAction[] = [
  PermissionAction.View,
  PermissionAction.Create,
  PermissionAction.Edit,
  PermissionAction.Approve,
];
