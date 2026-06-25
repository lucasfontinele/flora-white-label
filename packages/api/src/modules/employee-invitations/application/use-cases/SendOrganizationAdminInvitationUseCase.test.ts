import { describe, expect, it } from "vitest";
import { ForbiddenError } from "../../../../shared/application/errors/ForbiddenError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { MasterAccessRepository } from "../../../master-reports/application/repositories/MasterAccessRepository.js";
import {
  DEFAULT_ROLE_TEMPLATES,
  SUPER_ADMIN_ROLE_TEMPLATE,
} from "../../../access-control/domain/default-roles.js";
import type { Organization } from "../../../organizations/domain/entities/Organization.js";
import type { OrganizationPublicReadModel } from "../../../organizations/application/repositories/OrganizationRepository.js";
import type {
  OrganizationReadModel,
  OrganizationRepository,
} from "../../../organizations/application/repositories/OrganizationRepository.js";
import { makeOrganization } from "../../../organizations/application/use-cases/organization-use-case-test-utils.js";
import { SendOrganizationAdminInvitationUseCase } from "./SendOrganizationAdminInvitationUseCase.js";
import {
  FakeEmailService,
  FakeRoleRepository,
  InMemoryEmployeeInvitationRepository,
  immediateUnitOfWork,
} from "./employee-invitation-test-utils.js";

class FakeMasterAccessRepository implements MasterAccessRepository {
  constructor(private readonly masters: Set<string>) {}

  async isMaster(userId: string): Promise<boolean> {
    return this.masters.has(userId);
  }
}

class FakeOrganizationRepository implements OrganizationRepository {
  constructor(private readonly organization: Organization | null) {}

  async findById(): Promise<Organization | null> {
    return this.organization;
  }

  async findByCnpj(): Promise<Organization | null> {
    throw new Error("Method not implemented.");
  }
  async findByCnpjExcludingId(): Promise<Organization | null> {
    throw new Error("Method not implemented.");
  }
  async findBySlug(): Promise<OrganizationPublicReadModel | null> {
    throw new Error("Method not implemented.");
  }
  async findDetailsById(): Promise<OrganizationReadModel | null> {
    throw new Error("Method not implemented.");
  }
  async findAllDetails(): Promise<OrganizationReadModel[]> {
    throw new Error("Method not implemented.");
  }
  async create(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async save(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

const MASTER_ID = "master-1";
const ORG_ID = "organization-1";

function setup(options?: { master?: boolean; organization?: Organization | null }) {
  const invitationRepository = new InMemoryEmployeeInvitationRepository();
  const roleRepository = new FakeRoleRepository();
  const emailService = new FakeEmailService();
  const masterAccessRepository = new FakeMasterAccessRepository(
    new Set(options?.master === false ? [] : [MASTER_ID]),
  );
  const organization =
    options?.organization === undefined ? makeOrganization(ORG_ID) : options.organization;
  const organizationRepository = new FakeOrganizationRepository(organization);

  const useCase = new SendOrganizationAdminInvitationUseCase({
    masterAccessRepository,
    organizationRepository,
    roleRepository,
    invitationRepository,
    emailService,
    unitOfWork: immediateUnitOfWork,
    webAppUrl: "https://app.test",
  });

  return { useCase, invitationRepository, roleRepository, emailService };
}

describe("SendOrganizationAdminInvitationUseCase", () => {
  it("provisions the default roles and invites the admin into SUPER_ADMIN", async () => {
    const { useCase, invitationRepository, roleRepository, emailService } = setup();

    const result = await useCase.execute({
      requesterUserId: MASTER_ID,
      organizationId: ORG_ID,
      email: "Admin@Flora.LOCAL",
    });

    // All default roles were provisioned (Operador, Analista, Administrador,
    // Diretoria, Super admin).
    expect(roleRepository.createdKeys).toEqual([
      ...DEFAULT_ROLE_TEMPLATES.map((template) => template.key),
      SUPER_ADMIN_ROLE_TEMPLATE.key,
    ]);

    const superAdmin = await roleRepository.findByKeyInOrganization(
      ORG_ID,
      SUPER_ADMIN_ROLE_TEMPLATE.key,
    );
    expect(superAdmin).not.toBeNull();
    expect(result.roleId).toBe(superAdmin?.id);

    expect(result.status).toBe("PENDING");
    expect(result.email).toBe("admin@flora.local");
    expect(invitationRepository.createCalls).toBe(1);

    expect(emailService.sent).toHaveLength(1);
    const message = emailService.sent[0];
    expect(message?.to).toBe("admin@flora.local");
    expect(message?.subject).toBe("Flora - Convite de administrador");
    expect(message?.text).toContain("https://app.test/convite/");
  });

  it("does not re-create existing roles (idempotent provisioning)", async () => {
    const { useCase, roleRepository } = setup();

    await useCase.execute({ requesterUserId: MASTER_ID, organizationId: ORG_ID, email: "a@flora.local" });
    roleRepository.createdKeys.length = 0;
    await useCase.execute({ requesterUserId: MASTER_ID, organizationId: ORG_ID, email: "b@flora.local" });

    expect(roleRepository.createdKeys).toEqual([]);
  });

  it("reuses and resends an existing pending invitation for the same email", async () => {
    const { useCase, invitationRepository } = setup();

    await useCase.execute({ requesterUserId: MASTER_ID, organizationId: ORG_ID, email: "dup@flora.local" });
    await useCase.execute({ requesterUserId: MASTER_ID, organizationId: ORG_ID, email: "dup@flora.local" });

    expect(invitationRepository.invitations.size).toBe(1);
    expect(invitationRepository.createCalls).toBe(1);
    expect(invitationRepository.saveCalls).toBe(1);
  });

  it("rejects a non-master requester", async () => {
    const { useCase } = setup({ master: false });

    await expect(
      useCase.execute({ requesterUserId: "intruder", organizationId: ORG_ID, email: "x@flora.local" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects an unknown organization", async () => {
    const { useCase } = setup({ organization: null });

    await expect(
      useCase.execute({ requesterUserId: MASTER_ID, organizationId: "missing", email: "x@flora.local" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
