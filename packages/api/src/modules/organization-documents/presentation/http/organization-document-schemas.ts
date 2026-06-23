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

export const patientRequiredDocumentUploadParamsSchema = patientDocumentApprovalsParamsSchema
  .extend({
    documentId: nonBlankString("documentId"),
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

export const createUploadFileMetadataSchema = (config: {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}) =>
  z
    .object({
      fileName: nonBlankString("fileName"),
      mimeType: nonBlankString("mimeType").transform((value) => value.toLowerCase()),
      size: z.number().int().positive("size must be greater than zero."),
    })
    .strict()
    .superRefine((value, ctx) => {
      if (value.size > config.maxSizeBytes) {
        ctx.addIssue({
          code: "custom",
          path: ["size"],
          message: `size must be less than or equal to ${config.maxSizeBytes}.`,
        });
      }

      if (!config.allowedMimeTypes.includes(value.mimeType)) {
        ctx.addIssue({
          code: "custom",
          path: ["mimeType"],
          message: "mimeType is not allowed.",
        });
      }
    });

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

export const patientRequiredDocumentUploadParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "patientId", "documentId"],
  properties: {
    organizationId: idParamJsonProperty,
    patientId: idParamJsonProperty,
    documentId: idParamJsonProperty,
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

// Documents the multipart/form-data body so OpenAPI/Swagger renders a file
// picker. The body itself is consumed manually via `request.file()` (the
// multipart plugin runs in manual mode), so this schema is documentation-only
// and route body validation is skipped for upload routes.
export const uploadDocumentBodyJsonSchema = {
  type: "object",
  required: ["file"],
  properties: {
    file: {
      type: "string",
      format: "binary",
      description: "Arquivo do documento a ser enviado.",
    },
    performedByUserId: {
      type: "string",
      description: "Opcional: id do usuário que está enviando o arquivo (auditoria).",
    },
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
    "fileName",
    "mimeType",
    "size",
    "storageKey",
    "fileUrl",
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
    fileName: { type: ["string", "null"] },
    mimeType: { type: ["string", "null"] },
    size: { type: ["integer", "null"], minimum: 1 },
    storageKey: { type: ["string", "null"] },
    fileUrl: { type: ["string", "null"] },
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
        "UPLOADED_DOCUMENT",
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

const patientStatusValues = ["WAITING_DOCUMENTS", "WAITING_APPROVAL", "APPROVAL", "REJECTED"] as const;

export const listPatientsQuerySchema = z
  .object({
    status: z.enum(patientStatusValues).optional(),
  })
  .strict();

export const listPatientsQueryJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: { type: "string", enum: patientStatusValues },
  },
} as const;

export const rejectPatientRegistrationBodySchema = z
  .object({
    reason: nonBlankString("reason"),
  })
  .strict();

export const rejectPatientRegistrationBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reason"],
  properties: {
    reason: { type: "string", minLength: 1 },
  },
} as const;

export const patientResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "name",
    "document",
    "birthdate",
    "gender",
    "underPrivileged",
    "patientStatus",
    "rejectionReason",
    "guardianName",
    "createdAt",
  ],
  properties: {
    id: idParamJsonProperty,
    name: { type: "string" },
    document: { type: "string" },
    birthdate: { type: "string", format: "date-time" },
    gender: { type: "string" },
    underPrivileged: { type: "boolean" },
    patientStatus: { type: "string", enum: patientStatusValues },
    rejectionReason: { type: ["string", "null"] },
    guardianName: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

export const patientListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: { type: "array", items: patientResponseSchema },
  },
} as const;

export const patientApprovalDetailsResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["patient", "requiredDocuments", "approvals"],
  properties: {
    patient: patientResponseSchema,
    requiredDocuments: { type: "array", items: requiredDocumentResponseSchema },
    approvals: { type: "array", items: patientDocumentApprovalResponseSchema },
  },
} as const;

export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;
export type RejectPatientRegistrationBody = z.infer<typeof rejectPatientRegistrationBodySchema>;

export type OrganizationRequiredDocumentParams = z.infer<
  typeof organizationRequiredDocumentParamsSchema
>;
export type RequiredDocumentParams = z.infer<typeof requiredDocumentParamsSchema>;
export type PatientDocumentApprovalsParams = z.infer<typeof patientDocumentApprovalsParamsSchema>;
export type PatientDocumentApprovalActionParams = z.infer<
  typeof patientDocumentApprovalActionParamsSchema
>;
export type PatientRequiredDocumentUploadParams = z.infer<
  typeof patientRequiredDocumentUploadParamsSchema
>;
export type RequiredDocumentBody = z.infer<typeof requiredDocumentBodySchema>;
export type CreatePatientDocumentApprovalBody = z.infer<
  typeof createPatientDocumentApprovalBodySchema
>;
export type ApprovalActionBody = z.infer<typeof approvalActionBodySchema>;
export type RejectApprovalBody = z.infer<typeof rejectApprovalBodySchema>;
export type UploadFileMetadata = z.infer<ReturnType<typeof createUploadFileMetadataSchema>>;
