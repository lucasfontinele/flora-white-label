import type { FastifyInstance, FastifyReply } from "fastify";
import { env } from "../../../../config/env.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import { makeOrganizationDocumentUseCases } from "../../infrastructure/create-organization-document-use-cases.factory.js";
import { OrganizationDocumentPresenter } from "./organization-document-presenter.js";
import {
  approvalActionBodyJsonSchema,
  approvalActionBodySchema,
  approvalLogListResponseSchema,
  createPatientDocumentApprovalBodyJsonSchema,
  createPatientDocumentApprovalBodySchema,
  createUploadFileMetadataSchema,
  errorResponseSchema,
  organizationRequiredDocumentParamsJsonSchema,
  organizationRequiredDocumentParamsSchema,
  patientDocumentApprovalActionParamsJsonSchema,
  patientDocumentApprovalActionParamsSchema,
  patientDocumentApprovalListResponseSchema,
  patientDocumentApprovalResponseSchema,
  patientDocumentApprovalsParamsJsonSchema,
  patientDocumentApprovalsParamsSchema,
  patientRequiredDocumentUploadParamsJsonSchema,
  patientRequiredDocumentUploadParamsSchema,
  rejectApprovalBodyJsonSchema,
  rejectApprovalBodySchema,
  requiredDocumentBodyJsonSchema,
  requiredDocumentBodySchema,
  requiredDocumentListResponseSchema,
  requiredDocumentParamsJsonSchema,
  requiredDocumentParamsSchema,
  requiredDocumentResponseSchema,
  uploadDocumentBodyJsonSchema,
  listPatientsQueryJsonSchema,
  listPatientsQuerySchema,
  patientApprovalDetailsResponseSchema,
  patientListResponseSchema,
  patientResponseSchema,
  rejectPatientRegistrationBodyJsonSchema,
  rejectPatientRegistrationBodySchema,
} from "./organization-document-schemas.js";

function sendValidationError(
  reply: FastifyReply,
  message: string,
  statusCode = 400,
): FastifyReply {
  return reply.status(statusCode).send({
    error: "ValidationError",
    message,
  });
}

function isFileTooLargeError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "FST_REQ_FILE_TOO_LARGE"
  );
}

function getMultipartStringField(fields: unknown, fieldName: string): string | undefined {
  if (!fields || typeof fields !== "object") {
    return undefined;
  }

  const field = (fields as Record<string, unknown>)[fieldName];
  if (!field || Array.isArray(field) || typeof field !== "object") {
    return undefined;
  }

  const value = (field as { value?: unknown }).value;
  return typeof value === "string" ? value : undefined;
}

/**
 * Upload routes consume multipart/form-data and read the file via
 * `request.file()`, so `request.body` stays undefined and JSON-schema body
 * validation would always fail with "Invalid request body". The body schema on
 * those routes is documentation-only (it makes Swagger render a file field);
 * we skip Fastify schema validation here and re-validate params with zod inside
 * each handler.
 */
const skipSchemaValidationForMultipart = () => () => true;

export async function organizationDocumentRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeOrganizationDocumentUseCases(app.prisma);

  app.post(
    "/organizations/:organizationId/required-documents",
    {
      schema: {
        tags: ["Organization Required Documents"],
        summary: "Cria um documento exigido pela organização.",
        params: organizationRequiredDocumentParamsJsonSchema,
        body: requiredDocumentBodyJsonSchema,
        response: {
          201: requiredDocumentResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationRequiredDocumentParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = requiredDocumentBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.createOrganizationRequiredDocumentUseCase.execute({
        organizationId: params.data.organizationId,
        name: body.data.name,
        observations: body.data.observations,
      });

      return reply.status(201).send(OrganizationDocumentPresenter.requiredDocumentToHttp(output));
    },
  );

  app.get(
    "/organizations/:organizationId/required-documents",
    {
      schema: {
        tags: ["Organization Required Documents"],
        summary: "Lista documentos exigidos pela organização.",
        params: organizationRequiredDocumentParamsJsonSchema,
        response: {
          200: requiredDocumentListResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationRequiredDocumentParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.listOrganizationRequiredDocumentsUseCase.execute(params.data);

      return {
        data: output.data.map((document) =>
          OrganizationDocumentPresenter.requiredDocumentToHttp(document),
        ),
      };
    },
  );

  app.put(
    "/organizations/:organizationId/required-documents/:documentId",
    {
      schema: {
        tags: ["Organization Required Documents"],
        summary: "Atualiza nome e observações de um documento exigido pela organização.",
        params: requiredDocumentParamsJsonSchema,
        body: requiredDocumentBodyJsonSchema,
        response: {
          200: requiredDocumentResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = requiredDocumentParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = requiredDocumentBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.updateOrganizationRequiredDocumentUseCase.execute({
        ...params.data,
        name: body.data.name,
        observations: body.data.observations,
      });

      return OrganizationDocumentPresenter.requiredDocumentToHttp(output);
    },
  );

  app.delete(
    "/organizations/:organizationId/required-documents/:documentId",
    {
      schema: {
        tags: ["Organization Required Documents"],
        summary: "Remove documento exigido sem approvals vinculados.",
        params: requiredDocumentParamsJsonSchema,
        response: {
          204: { type: "null" },
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = requiredDocumentParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      await useCases.deleteOrganizationRequiredDocumentUseCase.execute(params.data);

      return reply.status(204).send();
    },
  );

  app.post(
    "/organizations/:organizationId/patients/:patientId/document-approvals",
    {
      schema: {
        tags: ["Patient Document Approvals"],
        summary: "Cria approval pendente para documento de paciente.",
        params: patientDocumentApprovalsParamsJsonSchema,
        body: createPatientDocumentApprovalBodyJsonSchema,
        response: {
          201: patientDocumentApprovalResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientDocumentApprovalsParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = createPatientDocumentApprovalBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.createPatientDocumentApprovalUseCase.execute({
        ...params.data,
        documentId: body.data.documentId,
      });

      return reply.status(201).send(OrganizationDocumentPresenter.approvalToHttp(output));
    },
  );

  app.post(
    "/organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/upload",
    {
      schema: {
        tags: ["Patient Document Approvals"],
        summary: "Envia arquivo de documento do paciente para approval existente.",
        consumes: ["multipart/form-data"],
        params: patientDocumentApprovalActionParamsJsonSchema,
        body: uploadDocumentBodyJsonSchema,
        response: {
          200: patientDocumentApprovalResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          413: errorResponseSchema,
          415: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
      validatorCompiler: skipSchemaValidationForMultipart,
    },
    async (request, reply) => {
      const params = patientDocumentApprovalActionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const file = await request.file();
      if (!file) {
        return sendValidationError(reply, "File is required.");
      }

      let content: Buffer;
      try {
        content = await file.toBuffer();
      } catch (error) {
        if (isFileTooLargeError(error)) {
          return sendValidationError(reply, "File size exceeds the configured limit.", 413);
        }

        throw error;
      }

      const metadataSchema = createUploadFileMetadataSchema({
        allowedMimeTypes: env.DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES,
        maxSizeBytes: env.MAX_DOCUMENT_UPLOAD_SIZE_BYTES,
      });
      const metadata = metadataSchema.safeParse({
        fileName: file.filename,
        mimeType: file.mimetype,
        size: content.byteLength,
      });
      if (!metadata.success) {
        const hasUnsupportedMime = metadata.error.issues.some((issue) =>
          issue.path.includes("mimeType"),
        );
        const hasOversize = metadata.error.issues.some((issue) => issue.path.includes("size"));

        return sendValidationError(
          reply,
          "Invalid upload file.",
          hasOversize ? 413 : hasUnsupportedMime ? 415 : 400,
        );
      }

      const output = await useCases.uploadPatientDocumentUseCase.execute({
        ...params.data,
        fileName: metadata.data.fileName,
        mimeType: metadata.data.mimeType,
        size: metadata.data.size,
        content,
        performedByUserId: getMultipartStringField(file.fields, "performedByUserId"),
      });

      return OrganizationDocumentPresenter.approvalToHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/patients/:patientId/required-documents/:documentId/upload",
    {
      schema: {
        tags: ["Patient Document Approvals"],
        summary: "Paciente envia o arquivo de um documento exigido (cria ou atualiza a approval).",
        consumes: ["multipart/form-data"],
        params: patientRequiredDocumentUploadParamsJsonSchema,
        body: uploadDocumentBodyJsonSchema,
        response: {
          200: patientDocumentApprovalResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          413: errorResponseSchema,
          415: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
      validatorCompiler: skipSchemaValidationForMultipart,
    },
    async (request, reply) => {
      const params = patientRequiredDocumentUploadParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const file = await request.file();
      if (!file) {
        return sendValidationError(reply, "File is required.");
      }

      let content: Buffer;
      try {
        content = await file.toBuffer();
      } catch (error) {
        if (isFileTooLargeError(error)) {
          return sendValidationError(reply, "File size exceeds the configured limit.", 413);
        }

        throw error;
      }

      const metadataSchema = createUploadFileMetadataSchema({
        allowedMimeTypes: env.DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES,
        maxSizeBytes: env.MAX_DOCUMENT_UPLOAD_SIZE_BYTES,
      });
      const metadata = metadataSchema.safeParse({
        fileName: file.filename,
        mimeType: file.mimetype,
        size: content.byteLength,
      });
      if (!metadata.success) {
        const hasUnsupportedMime = metadata.error.issues.some((issue) =>
          issue.path.includes("mimeType"),
        );
        const hasOversize = metadata.error.issues.some((issue) => issue.path.includes("size"));

        return sendValidationError(
          reply,
          "Invalid upload file.",
          hasOversize ? 413 : hasUnsupportedMime ? 415 : 400,
        );
      }

      const output = await useCases.uploadPatientRequiredDocumentUseCase.execute({
        ...params.data,
        fileName: metadata.data.fileName,
        mimeType: metadata.data.mimeType,
        size: metadata.data.size,
        content,
        performedByUserId: getMultipartStringField(file.fields, "performedByUserId"),
      });

      return OrganizationDocumentPresenter.approvalToHttp(output);
    },
  );

  app.get(
    "/organizations/:organizationId/patients/:patientId/document-approvals",
    {
      schema: {
        tags: ["Patient Document Approvals"],
        summary: "Lista approvals de documentos do paciente.",
        params: patientDocumentApprovalsParamsJsonSchema,
        response: {
          200: patientDocumentApprovalListResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientDocumentApprovalsParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.listPatientDocumentApprovalsUseCase.execute(params.data);

      return {
        data: output.data.map((approval) => OrganizationDocumentPresenter.approvalToHttp(approval)),
      };
    },
  );

  app.post(
    "/organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/approve",
    {
      schema: {
        tags: ["Patient Document Approvals"],
        summary: "Aprova documento do paciente e gera log.",
        params: patientDocumentApprovalActionParamsJsonSchema,
        body: approvalActionBodyJsonSchema,
        response: {
          200: patientDocumentApprovalResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientDocumentApprovalActionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = approvalActionBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.approvePatientDocumentUseCase.execute({
        ...params.data,
        organizationUserId: body.data.organizationUserId,
      });

      return OrganizationDocumentPresenter.approvalToHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/reject",
    {
      schema: {
        tags: ["Patient Document Approvals"],
        summary: "Rejeita documento do paciente e gera log.",
        params: patientDocumentApprovalActionParamsJsonSchema,
        body: rejectApprovalBodyJsonSchema,
        response: {
          200: patientDocumentApprovalResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientDocumentApprovalActionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = rejectApprovalBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.rejectPatientDocumentUseCase.execute({
        ...params.data,
        organizationUserId: body.data.organizationUserId,
        rejectedReason: body.data.rejectedReason,
      });

      return OrganizationDocumentPresenter.approvalToHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/reset-to-pending",
    {
      schema: {
        tags: ["Patient Document Approvals"],
        summary: "Reseta documento do paciente para pendente e gera log.",
        params: patientDocumentApprovalActionParamsJsonSchema,
        body: approvalActionBodyJsonSchema,
        response: {
          200: patientDocumentApprovalResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientDocumentApprovalActionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = approvalActionBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.resetPatientDocumentToPendingUseCase.execute({
        ...params.data,
        organizationUserId: body.data.organizationUserId,
      });

      return OrganizationDocumentPresenter.approvalToHttp(output);
    },
  );

  app.get(
    "/organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/logs",
    {
      schema: {
        tags: ["Patient Document Approvals"],
        summary: "Lista logs append-only de approval de documento.",
        params: patientDocumentApprovalActionParamsJsonSchema,
        response: {
          200: approvalLogListResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientDocumentApprovalActionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.listPatientDocumentApprovalLogsUseCase.execute(params.data);

      return {
        data: output.data.map((log) => OrganizationDocumentPresenter.logToHttp(log)),
      };
    },
  );

  app.get(
    "/organizations/:organizationId/patients",
    {
      schema: {
        tags: ["Patient Registration Approvals"],
        summary: "Lista pacientes da organização, opcionalmente filtrando por status.",
        params: organizationRequiredDocumentParamsJsonSchema,
        querystring: listPatientsQueryJsonSchema,
        response: {
          200: patientListResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationRequiredDocumentParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const query = listPatientsQuerySchema.safeParse(request.query);
      if (!query.success) {
        return sendValidationError(reply, "Invalid request query.");
      }

      const output = await useCases.listOrganizationPatientsUseCase.execute({
        organizationId: params.data.organizationId,
        status: query.data.status as PatientStatus | undefined,
      });

      return {
        data: output.data.map((patient) => OrganizationDocumentPresenter.patientToHttp(patient)),
      };
    },
  );

  app.get(
    "/organizations/:organizationId/patients/:patientId",
    {
      schema: {
        tags: ["Patient Registration Approvals"],
        summary: "Detalhes do paciente com documentos exigidos e approvals enviados.",
        params: patientDocumentApprovalsParamsJsonSchema,
        response: {
          200: patientApprovalDetailsResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientDocumentApprovalsParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.getPatientApprovalDetailsUseCase.execute(params.data);

      return OrganizationDocumentPresenter.patientApprovalDetailsToHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/patients/:patientId/approve-registration",
    {
      schema: {
        tags: ["Patient Registration Approvals"],
        summary: "Aprova o cadastro do paciente (exige todos os documentos aprovados).",
        params: patientDocumentApprovalsParamsJsonSchema,
        response: {
          200: patientResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientDocumentApprovalsParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.approvePatientRegistrationUseCase.execute(params.data);

      return OrganizationDocumentPresenter.patientToHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/patients/:patientId/reject-registration",
    {
      schema: {
        tags: ["Patient Registration Approvals"],
        summary: "Recusa o cadastro do paciente com um motivo.",
        params: patientDocumentApprovalsParamsJsonSchema,
        body: rejectPatientRegistrationBodyJsonSchema,
        response: {
          200: patientResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientDocumentApprovalsParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = rejectPatientRegistrationBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.rejectPatientRegistrationUseCase.execute({
        ...params.data,
        reason: body.data.reason,
      });

      return OrganizationDocumentPresenter.patientToHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/patients/:patientId/revoke-access",
    {
      schema: {
        tags: ["Patient Registration Approvals"],
        summary: "Revoga o acesso do paciente (volta para WAITING_DOCUMENTS, bloqueia o catálogo).",
        params: patientDocumentApprovalsParamsJsonSchema,
        response: {
          200: patientResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientDocumentApprovalsParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.revokePatientAccessUseCase.execute(params.data);

      return OrganizationDocumentPresenter.patientToHttp(output);
    },
  );
}
