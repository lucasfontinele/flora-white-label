import { z } from "zod";

const nonBlankString = (field: string) => z.string().trim().min(1, `${field} is required.`);

export const organizationRequiredDocumentParamsSchema = z
  .object({
    organizationId: nonBlankString("organizationId"),
  })
  .strict();

export const requiredDocumentParamsSchema = organizationRequiredDocumentParamsSchema
  .extend({
    documentId: nonBlankString("documentId"),
  })
  .strict();

export const patientDocumentApprovalsParamsSchema = organizationRequiredDocumentParamsSchema
  .extend({
    patientId: nonBlankString("patientId"),
  })
  .strict();

export const patientDocumentApprovalActionParamsSchema = patientDocumentApprovalsParamsSchema
  .extend({
    approvalId: nonBlankString("approvalId"),
  })
  .strict();

export const requiredDocumentBodySchema = z
  .object({
    name: nonBlankString("name"),
    observations: z.string().trim().nullish(),
  })
  .strict();

export const createPatientDocumentApprovalBodySchema = z
  .object({
    documentId: nonBlankString("documentId"),
  })
  .strict();

export const approvalActionBodySchema = z
  .object({
    organizationUserId: nonBlankString("organizationUserId"),
  })
  .strict();

export const rejectApprovalBodySchema = approvalActionBodySchema
  .extend({
    rejectedReason: nonBlankString("rejectedReason"),
  })
  .strict();

const idParamJsonProperty = {
  type: "string",
  minLength: 1,
} as const;

export const organizationRequiredDocumentParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: {
    organizationId: idParamJsonProperty,
  },
} as const;

export const requiredDocumentParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "documentId"],
  properties: {
    organizationId: idParamJsonProperty,
    documentId: idParamJsonProperty,
  },
} as const;

export const patientDocumentApprovalsParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "patientId"],
  properties: {
    organizationId: idParamJsonProperty,
    patientId: idParamJsonProperty,
  },
} as const;

export const patientDocumentApprovalActionParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "patientId", "approvalId"],
  properties: {
    organizationId: idParamJsonProperty,
    patientId: idParamJsonProperty,
    approvalId: idParamJsonProperty,
  },
} as const;

export const requiredDocumentBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name"],
  properties: {
    name: {
      type: "string",
      minLength: 1,
    },
    observations: {
      type: ["string", "null"],
    },
  },
} as const;

export const createPatientDocumentApprovalBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["documentId"],
  properties: {
    documentId: idParamJsonProperty,
  },
} as const;

export const approvalActionBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationUserId"],
  properties: {
    organizationUserId: idParamJsonProperty,
  },
} as const;

export const rejectApprovalBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationUserId", "rejectedReason"],
  properties: {
    organizationUserId: idParamJsonProperty,
    rejectedReason: {
      type: "string",
      minLength: 1,
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

export const requiredDocumentResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "organizationId", "name", "observations", "createdAt", "updatedAt"],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    name: { type: "string", minLength: 1 },
    observations: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const requiredDocumentListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: requiredDocumentResponseSchema,
    },
  },
} as const;

export const patientDocumentApprovalResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "organizationId",
    "documentId",
    "patientId",
    "status",
    "rejectedReason",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    documentId: idParamJsonProperty,
    patientId: idParamJsonProperty,
    status: {
      type: "string",
      enum: ["PENDING", "REJECTED", "APPROVED"],
    },
    rejectedReason: {
      type: ["string", "null"],
    },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const patientDocumentApprovalListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: patientDocumentApprovalResponseSchema,
    },
  },
} as const;

export const approvalLogResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "action", "patientApprovalId", "organizationUserId", "createdAt"],
  properties: {
    id: idParamJsonProperty,
    action: {
      type: "string",
      enum: [
        "CREATED_PATIENT_DOCUMENT_APPROVAL",
        "APPROVED_DOCUMENT",
        "REJECTED_DOCUMENT",
        "RESET_DOCUMENT_TO_PENDING",
      ],
    },
    patientApprovalId: idParamJsonProperty,
    organizationUserId: idParamJsonProperty,
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

export const approvalLogListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: approvalLogResponseSchema,
    },
  },
} as const;

export type OrganizationRequiredDocumentParams = z.infer<
  typeof organizationRequiredDocumentParamsSchema
>;
export type RequiredDocumentParams = z.infer<typeof requiredDocumentParamsSchema>;
export type PatientDocumentApprovalsParams = z.infer<typeof patientDocumentApprovalsParamsSchema>;
export type PatientDocumentApprovalActionParams = z.infer<
  typeof patientDocumentApprovalActionParamsSchema
>;
export type RequiredDocumentBody = z.infer<typeof requiredDocumentBodySchema>;
export type CreatePatientDocumentApprovalBody = z.infer<
  typeof createPatientDocumentApprovalBodySchema
>;
export type ApprovalActionBody = z.infer<typeof approvalActionBodySchema>;
export type RejectApprovalBody = z.infer<typeof rejectApprovalBodySchema>;
