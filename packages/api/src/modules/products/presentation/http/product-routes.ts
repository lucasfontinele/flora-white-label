import type { FastifyInstance, FastifyReply } from "fastify";
import { env } from "../../../../config/env.js";
import type { ProductReadModel } from "../../application/repositories/ProductRepository.js";
import type { ProductImageStorageService } from "../../application/services/ProductImageStorageService.js";
import { makeProductUseCases } from "../../infrastructure/create-product-use-cases.factory.js";
import { ProductPresenter, type ProductResponse } from "./product-presenter.js";
import {
  createProductBodySchema,
  createProductImageMetadataSchema,
  errorResponseSchema,
  listProductsQueryJsonSchema,
  listProductsQuerySchema,
  organizationProductParamsJsonSchema,
  organizationProductParamsSchema,
  patientCatalogParamsJsonSchema,
  patientCatalogParamsSchema,
  patientCatalogResponseSchema,
  productListResponseSchema,
  productParamsJsonSchema,
  productParamsSchema,
  productResponseSchema,
  productWriteBodyJsonSchema,
  updateProductBodySchema,
  uploadProductCoverImageBodyJsonSchema,
} from "./product-schemas.js";

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

async function resolveCoverImageUrl(
  storage: ProductImageStorageService,
  storageKey: string | null,
): Promise<string | null> {
  if (!storageKey) {
    return null;
  }

  try {
    return await storage.getImageUrl(storageKey);
  } catch {
    return null;
  }
}

function isFileTooLargeError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "FST_REQ_FILE_TOO_LARGE"
  );
}

/**
 * Upload routes consume multipart/form-data and read the file via
 * `request.file()`, so `request.body` stays undefined and JSON-schema body
 * validation would always fail. The body schema is documentation-only (it makes
 * Swagger render a file field); we skip Fastify validation and re-validate
 * params/file with zod inside the handler.
 */
const skipSchemaValidationForMultipart = () => () => true;

export async function productRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeProductUseCases(app.prisma);

  /**
   * Builds a product response, resolving a fresh presigned URL for the stored
   * cover image key. Failing to resolve the URL must not break the response, so
   * the product is still returned (without a URL) when storage is unreachable.
   */
  async function presentProduct(product: ProductReadModel): Promise<ProductResponse> {
    const coverImageUrl = await resolveCoverImageUrl(
      useCases.coverImageStorage,
      product.coverImageStorageKey,
    );

    return ProductPresenter.toHttp(product, coverImageUrl);
  }

  app.post(
    "/organizations/:organizationId/products",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Cria um produto da organização.",
        params: organizationProductParamsJsonSchema,
        body: productWriteBodyJsonSchema,
        response: {
          201: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationProductParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = createProductBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.createProductUseCase.execute({
        organizationId: params.data.organizationId,
        ...body.data,
      });

      return reply.status(201).send(await presentProduct(output));
    },
  );

  app.get(
    "/organizations/:organizationId/products",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Lista produtos da organização.",
        params: organizationProductParamsJsonSchema,
        querystring: listProductsQueryJsonSchema,
        response: {
          200: productListResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationProductParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const query = listProductsQuerySchema.safeParse(request.query);
      if (!query.success) {
        return sendValidationError(reply, "Invalid request query.");
      }

      const output = await useCases.listProductsUseCase.execute(params.data);

      return {
        data: await Promise.all(output.data.map((product) => presentProduct(product))),
      };
    },
  );

  app.get(
    "/organizations/:organizationId/patients/:patientId/catalog",
    {
      schema: {
        tags: ["Organization Products"],
        summary:
          "Catálogo visível ao paciente (produtos liberados pela posologia) + categorias para filtro.",
        params: patientCatalogParamsJsonSchema,
        response: {
          200: patientCatalogResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientCatalogParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.getPatientCatalogUseCase.execute(params.data);

      return {
        categories: output.categories,
        products: await Promise.all(output.products.map((product) => presentProduct(product))),
      };
    },
  );

  app.get(
    "/organizations/:organizationId/products/:productId",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Busca um produto da organização pelo ID.",
        params: productParamsJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.getProductByIdUseCase.execute(params.data);

      return presentProduct(output);
    },
  );

  app.put(
    "/organizations/:organizationId/products/:productId",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Atualiza um produto da organização.",
        params: productParamsJsonSchema,
        body: productWriteBodyJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = updateProductBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.updateProductUseCase.execute({
        ...params.data,
        ...body.data,
      });

      return presentProduct(output);
    },
  );

  app.delete(
    "/organizations/:organizationId/products/:productId",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Remove logicamente um produto da organização.",
        params: productParamsJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.deleteProductUseCase.execute(params.data);

      return presentProduct(output);
    },
  );

  app.patch(
    "/organizations/:organizationId/products/:productId/activate",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Ativa um produto da organização.",
        params: productParamsJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.activateProductUseCase.execute(params.data);

      return presentProduct(output);
    },
  );

  app.patch(
    "/organizations/:organizationId/products/:productId/deactivate",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Desativa um produto da organização.",
        params: productParamsJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.deactivateProductUseCase.execute(params.data);

      return presentProduct(output);
    },
  );

  app.put(
    "/organizations/:organizationId/products/:productId/cover-image",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Envia (ou substitui) a imagem de capa do produto.",
        consumes: ["multipart/form-data"],
        params: productParamsJsonSchema,
        body: uploadProductCoverImageBodyJsonSchema,
        response: {
          200: productResponseSchema,
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
      const params = productParamsSchema.safeParse(request.params);
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
          return sendValidationError(reply, "Image size exceeds the configured limit.", 413);
        }

        throw error;
      }

      const metadataSchema = createProductImageMetadataSchema({
        allowedMimeTypes: env.PRODUCT_IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
        maxSizeBytes: env.MAX_PRODUCT_IMAGE_UPLOAD_SIZE_BYTES,
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
          "Invalid image file.",
          hasOversize ? 413 : hasUnsupportedMime ? 415 : 400,
        );
      }

      const output = await useCases.uploadProductCoverImageUseCase.execute({
        ...params.data,
        fileName: metadata.data.fileName,
        mimeType: metadata.data.mimeType,
        size: metadata.data.size,
        content,
      });

      return presentProduct(output);
    },
  );

  app.delete(
    "/organizations/:organizationId/products/:productId/cover-image",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Remove a imagem de capa do produto.",
        params: productParamsJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.removeProductCoverImageUseCase.execute(params.data);

      return presentProduct(output);
    },
  );
}
