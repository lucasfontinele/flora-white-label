import { z } from "zod";

/**
 * The organization filter arrives as a single comma-separated query value
 * (`?organizationIds=org-1,org-2`). An empty/absent value means "the whole
 * network". Blank entries are dropped and duplicates are collapsed.
 */
export const masterReportsQuerySchema = z
  .object({
    organizationIds: z
      .string()
      .optional()
      .transform((value) =>
        value
          ? [...new Set(value.split(",").map((id) => id.trim()).filter((id) => id.length > 0))]
          : [],
      ),
  })
  .strip();

export const masterReportsQueryJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    organizationIds: { type: "string" },
  },
} as const;

/** The requester identity is carried in the `x-master-user-id` header. */
export const masterReportsHeadersSchema = z
  .object({
    "x-master-user-id": z.string().trim().min(1).optional(),
  })
  .passthrough();

const metricSchema = {
  type: "object",
  additionalProperties: false,
  required: ["delta", "hint", "icon", "label", "value"],
  properties: {
    delta: { type: "string" },
    hint: { type: "string" },
    icon: { type: "string" },
    label: { type: "string" },
    tone: { type: "string", enum: ["success", "error"] },
    value: { type: "string" },
  },
} as const;

export const masterReportsResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "object",
      additionalProperties: false,
      required: [
        "metrics",
        "monthlyOrganizations",
        "networkHealth",
        "planDistribution",
        "recentOrganizations",
        "referenceLabel",
      ],
      properties: {
        metrics: { type: "array", items: metricSchema },
        monthlyOrganizations: {
          type: "object",
          additionalProperties: false,
          required: ["growthLabel", "points"],
          properties: {
            growthLabel: { type: "string" },
            points: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["month", "value"],
                properties: {
                  month: { type: "string" },
                  value: { type: "integer", minimum: 0 },
                },
              },
            },
          },
        },
        networkHealth: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["icon", "label", "value"],
            properties: {
              icon: { type: "string" },
              label: { type: "string" },
              value: { type: "string" },
            },
          },
        },
        planDistribution: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "organizations", "percentage"],
            properties: {
              name: { type: "string" },
              organizations: { type: "integer", minimum: 0 },
              percentage: { type: "integer", minimum: 0, maximum: 100 },
            },
          },
        },
        recentOrganizations: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["createdAt", "city", "plan", "state", "tradeName"],
            properties: {
              createdAt: { type: "string" },
              city: { type: "string" },
              plan: { type: "string" },
              state: { type: "string" },
              tradeName: { type: "string" },
            },
          },
        },
        referenceLabel: { type: "string" },
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

export type MasterReportsQuery = z.infer<typeof masterReportsQuerySchema>;
