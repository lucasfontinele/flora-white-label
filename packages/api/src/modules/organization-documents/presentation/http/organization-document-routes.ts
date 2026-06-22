import type { FastifyInstance, FastifyReply } from "fastify";
import { makeOrganizationDocumentUseCases } from "../../infrastructure/create-organization-document-use-cases.factory.js";
import { OrganizationDocumentPresenter } from "./organization-document-presenter.js";
import {
  approvalActionBodyJsonSchema,
  approvalActionBodySchema,
  approvalLogListResponseSchema,
  createPatientDocumentApprovalBodyJsonSchema,
  createPatientDocumentApprovalBodySchema,
  errorResponseSchema,
  organizationRequiredDocumentParamsJsonSchema,
  organizationRequiredDocumentParamsSchema,
  patientDocumentApprovalActionParamsJsonSchema,
  patientDocumentApprovalActionParamsSchema,
  patientDocumentApprovalListResponseSchema,
  patientDocumentApprovalResponseSchema,
  patientDocumentApprovalsParamsJsonSchema,
  patientDocumentApprovalsParamsSchema,
  rejectApprovalBodyJsonSchema,
  rejectApprovalBodySchema,
  requiredDocumentBodyJsonSchema,
  requiredDocumentBodySchema,
  requiredDocumentListResponseSchema,
  requiredDocumentParamsJsonSchema,
  requiredDocumentParamsSchema,
  requiredDocumentResponseSchema,
} from "./organization-document-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

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
}
