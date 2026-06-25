import { z } from "zod";
import { PermissionAction } from "../../domain/enums/PermissionAction.js";
import { PermissionModule } from "../../domain/enums/PermissionModule.js";

const nonBlankString = (field: string) => z.string().trim().min(1, `${field} is required.`);

const permissionModuleValues = [
  PermissionModule.Orders,
  PermissionModule.Associates,
  PermissionModule.Products,
  PermissionModule.Inventory,
  PermissionModule.Documents,
  PermissionModule.Settings,
  PermissionModule.Access,
] as const;

const permissionActionValues = [
  PermissionAction.View,
  PermissionAction.Create,
  PermissionAction.Edit,
  PermissionAction.Approve,
] as const;

export const organizationParamsSchema = z
  .object({
    organizationId: nonBlankString("organizationId"),
  })
  .strict();

export const roleParamsSchema = organizationParamsSchema
  .extend({
    roleId: nonBlankString("roleId"),
  })
  .strict();

export const employeeParamsSchema = organizationParamsSchema
  .extend({
    employeeId: nonBlankString("employeeId"),
  })
  .strict();

export const setRolePermissionsBodySchema = z
  .object({
    permissions: z
      .array(
        z
          .object({
            module: z.enum(permissionModuleValues),
            action: z.enum(permissionActionValues),
          })
          .strict(),
      )
      .max(permissionModuleValues.length * permissionActionValues.length),
  })
  .strict();

const idParamJsonProperty = { type: "string", minLength: 1 } as const;

export const organizationParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: {
    organizationId: idParamJsonProperty,
  },
} as const;

export const roleParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "roleId"],
  properties: {
    organizationId: idParamJsonProperty,
    roleId: idParamJsonProperty,
  },
} as const;

export const employeeParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "employeeId"],
  properties: {
    organizationId: idParamJsonProperty,
    employeeId: idParamJsonProperty,
  },
} as const;

export const setRolePermissionsBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["permissions"],
  properties: {
    permissions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["module", "action"],
        properties: {
          module: { type: "string", enum: permissionModuleValues },
          action: { type: "string", enum: permissionActionValues },
        },
      },
    },
  },
} as const;

export const errorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["error", "message"],
  properties: {
    error: { type: "string" },
    message: { type: "string" },
  },
} as const;

const permissionEntrySchema = {
  type: "object",
  additionalProperties: false,
  required: ["module", "action"],
  properties: {
    module: { type: "string", enum: permissionModuleValues },
    action: { type: "string", enum: permissionActionValues },
  },
} as const;

export const roleResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "organizationId",
    "key",
    "name",
    "description",
    "isSystem",
    "fullAccess",
    "viewAll",
    "permissions",
    "membersCount",
  ],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    key: { type: ["string", "null"] },
    name: { type: "string", minLength: 1 },
    description: { type: ["string", "null"] },
    isSystem: { type: "boolean" },
    fullAccess: { type: "boolean" },
    viewAll: { type: "boolean" },
    permissions: { type: "array", items: permissionEntrySchema },
    membersCount: { type: "integer", minimum: 0 },
  },
} as const;

export const employeePermissionsResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["employeeId", "roleId", "roleName", "fullAccess", "viewAll", "permissions"],
  properties: {
    employeeId: idParamJsonProperty,
    roleId: { type: ["string", "null"] },
    roleName: { type: ["string", "null"] },
    fullAccess: { type: "boolean" },
    viewAll: { type: "boolean" },
    permissions: { type: "array", items: permissionEntrySchema },
  },
} as const;

export const roleListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data", "catalog"],
  properties: {
    data: { type: "array", items: roleResponseSchema },
    catalog: {
      type: "object",
      additionalProperties: false,
      required: ["modules", "actions"],
      properties: {
        modules: { type: "array", items: { type: "string", enum: permissionModuleValues } },
        actions: { type: "array", items: { type: "string", enum: permissionActionValues } },
      },
    },
  },
} as const;

export type OrganizationParams = z.infer<typeof organizationParamsSchema>;
export type RoleParams = z.infer<typeof roleParamsSchema>;
export type EmployeeParams = z.infer<typeof employeeParamsSchema>;
export type SetRolePermissionsBody = z.infer<typeof setRolePermissionsBodySchema>;
