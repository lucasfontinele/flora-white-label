import { describe, expect, it } from "vitest";
import type { SubscriptionPlanDto } from "@flora/shared/organizations";
import { buildServer } from "../build-server.js";
import type { OrganizationRepository } from "../../../application/organizations/organization-repository.js";
import type { SubscriptionPlanRepository } from "../../../application/subscription-plans/subscription-plan-repository.js";

const plan: SubscriptionPlanDto = {
  code: "starter" as const,
  id: "plan_starter",
  maxActiveUsers: 50,
  maxOperators: 10,
  name: "Starter",
  operatorLimitType: "limited" as const,
  priceInCents: 59700,
};

const validPayload = {
  address: {
    cep: "77001-000",
    city: "Palmas",
    logradouro: "Quadra 101 Sul",
    neighborhood: "Plano Diretor Sul",
    number: "10",
    state: "TO",
  },
  company: {
    cnpj: "11.222.333/0001-81",
    foundationDate: "2020-01-15",
    institutionalEmail: "contato@associacao.org.br",
    legalName: "Associacao Medicinal Exemplo LTDA",
    primaryCnae: "9430-8/00",
    secondaryCnaes: [],
    tradeName: "Associacao Exemplo",
    whatsapp: "(63) 99999-0000",
  },
  subscriptionPlanId: "plan_starter",
};

const organizationRecord = {
  id: "org_1",
  address: {
    cep: "77001000",
    city: "Palmas",
    id: "addr_1",
    logradouro: "Quadra 101 Sul",
    neighborhood: "Plano Diretor Sul",
    number: "10",
    state: "TO",
  },
  addressId: "addr_1",
  cnpj: "11222333000181",
  createdAt: new Date("2026-06-16T00:00:00.000Z"),
  createdByMasterUserId: "master_1",
  foundationDate: new Date("2020-01-15T00:00:00.000Z"),
  institutionalEmail: "contato@associacao.org.br",
  legalName: "Associacao Medicinal Exemplo LTDA",
  primaryCnae: "9430-8/00",
  secondaryCnaes: [],
  subscriptionPlan: plan,
  subscriptionPlanId: "plan_starter",
  tradeName: "Associacao Exemplo",
  updatedAt: new Date("2026-06-16T00:00:00.000Z"),
  whatsapp: "63999990000",
};

function buildRepositories(overrides?: { cnpjExists?: boolean; organizations?: typeof organizationRecord[]; planExists?: boolean }) {
  const organizationRepository: OrganizationRepository = {
    async create(input) {
      return {
        id: "org_1",
        ...input.company,
        address: {
          id: "addr_1",
          ...input.address,
        },
        addressId: "addr_1",
        createdAt: new Date("2026-06-16T00:00:00.000Z"),
        createdByMasterUserId: input.createdByMasterUserId,
        subscriptionPlan: plan,
        subscriptionPlanId: input.subscriptionPlanId,
        updatedAt: new Date("2026-06-16T00:00:00.000Z"),
      };
    },
    async existsByCnpj() {
      return Boolean(overrides?.cnpjExists);
    },
    async list(input) {
      const organizations = overrides?.organizations ?? [organizationRecord];

      return {
        data: organizations,
        pagination: {
          page: input.page,
          perPage: input.perPage,
          total: organizations.length,
          totalPages: organizations.length === 0 ? 0 : 1,
        },
      };
    },
  };

  const subscriptionPlanRepository: SubscriptionPlanRepository = {
    async findById() {
      return overrides?.planExists === false ? null : plan;
    },
    async list() {
      return [plan];
    },
  };

  return { organizationRepository, subscriptionPlanRepository };
}

describe("organizations routes", () => {
  it("answers CORS preflight requests before Master authentication", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      headers: {
        "access-control-request-headers": "x-master-role,x-master-user-id",
        "access-control-request-method": "GET",
        origin: "http://localhost:3000",
      },
      method: "OPTIONS",
      url: "/organizations",
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(headerValue(response.headers["access-control-allow-methods"])).toContain("GET");
    expect(headerValue(response.headers["access-control-allow-methods"])).toContain("POST");
    expect(headerValue(response.headers["access-control-allow-headers"]).toLowerCase()).toContain("x-master-role");
    expect(headerValue(response.headers["access-control-allow-headers"]).toLowerCase()).toContain("x-master-user-id");
  });

  it("lists organizations for an authenticated Master", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      headers: {
        "x-master-role": "master",
        "x-master-user-id": "master_1",
      },
      method: "GET",
      url: "/organizations?page=1&perPage=20",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [
        {
          city: "Palmas",
          cnpj: "11222333000181",
          createdAt: "2026-06-16T00:00:00.000Z",
          id: "org_1",
          legalName: "Associacao Medicinal Exemplo LTDA",
          state: "TO",
          subscriptionPlan: plan,
          tradeName: "Associacao Exemplo",
        },
      ],
      pagination: {
        page: 1,
        perPage: 20,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it("returns an empty organization list with pagination metadata", async () => {
    const app = await buildServer(buildRepositories({ organizations: [] }));

    const response = await app.inject({
      headers: {
        "x-master-role": "master",
        "x-master-user-id": "master_1",
      },
      method: "GET",
      url: "/organizations",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [],
      pagination: {
        page: 1,
        perPage: 20,
        total: 0,
        totalPages: 0,
      },
    });
  });

  it("rejects missing Master authentication when listing organizations", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      method: "GET",
      url: "/organizations",
    });

    expect(response.statusCode).toBe(401);
  });

  it("rejects non-Master users when listing organizations", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      headers: {
        "x-master-role": "operator",
        "x-master-user-id": "user_1",
      },
      method: "GET",
      url: "/organizations",
    });

    expect(response.statusCode).toBe(403);
  });

  it("creates an organization for an authenticated Master", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      headers: {
        "x-master-role": "master",
        "x-master-user-id": "master_1",
      },
      method: "POST",
      payload: validPayload,
      url: "/organizations",
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.id).toBe("org_1");
    expect(response.json().data.company.cnpj).toBe("11222333000181");
    expect(response.json().data.subscriptionPlan).toEqual(plan);
    expect(response.json().data.createdByMasterUserId).toBe("master_1");
  });

  it("rejects invalid payloads with 400", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      headers: {
        "x-master-role": "master",
        "x-master-user-id": "master_1",
      },
      method: "POST",
      payload: { ...validPayload, company: { ...validPayload.company, cnpj: "invalid" } },
      url: "/organizations",
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects missing Master authentication with 401", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      method: "POST",
      payload: validPayload,
      url: "/organizations",
    });

    expect(response.statusCode).toBe(401);
  });

  it("rejects non-Master users with 403", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      headers: {
        "x-master-role": "operator",
        "x-master-user-id": "user_1",
      },
      method: "POST",
      payload: validPayload,
      url: "/organizations",
    });

    expect(response.statusCode).toBe(403);
  });

  it("rejects duplicate CNPJ with 409", async () => {
    const app = await buildServer(buildRepositories({ cnpjExists: true }));

    const response = await app.inject({
      headers: {
        "x-master-role": "master",
        "x-master-user-id": "master_1",
      },
      method: "POST",
      payload: validPayload,
      url: "/organizations",
    });

    expect(response.statusCode).toBe(409);
  });

  it("rejects unavailable subscription plans with 400", async () => {
    const app = await buildServer(buildRepositories({ planExists: false }));

    const response = await app.inject({
      headers: {
        "x-master-role": "master",
        "x-master-user-id": "master_1",
      },
      method: "POST",
      payload: validPayload,
      url: "/organizations",
    });

    expect(response.statusCode).toBe(400);
  });
});

function headerValue(value: string | string[] | number | undefined) {
  if (Array.isArray(value)) return value.join(",");
  return String(value ?? "");
}
