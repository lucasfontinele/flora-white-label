import { describe, expect, it } from "vitest";
import { SendEmployeeInvitationUseCase } from "./SendEmployeeInvitationUseCase.js";
import {
  FakeEmailService,
  FakeRoleRepository,
  InMemoryEmployeeInvitationRepository,
  buildRole,
  immediateUnitOfWork,
} from "./employee-invitation-test-utils.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

function setup(options?: { fullAccessRole?: boolean }) {
  const invitationRepository = new InMemoryEmployeeInvitationRepository();
  const role = buildRole({ id: "role-1", fullAccess: options?.fullAccessRole ?? false });
  const roleRepository = new FakeRoleRepository([role]);
  const emailService = new FakeEmailService();

  const useCase = new SendEmployeeInvitationUseCase({
    invitationRepository,
    roleRepository,
    emailService,
    unitOfWork: immediateUnitOfWork,
    webAppUrl: "https://app.test",
  });

  return { useCase, invitationRepository, emailService };
}

describe("SendEmployeeInvitationUseCase", () => {
  it("creates a pending invitation and sends the CTA e-mail", async () => {
    const { useCase, invitationRepository, emailService } = setup();

    const result = await useCase.execute({
      organizationId: "org-1",
      email: "New@Flora.LOCAL",
      roleId: "role-1",
    });

    expect(result.status).toBe("PENDING");
    expect(result.email).toBe("new@flora.local");
    expect(invitationRepository.createCalls).toBe(1);

    expect(emailService.sent).toHaveLength(1);
    const message = emailService.sent[0];
    expect(message?.to).toBe("new@flora.local");
    expect(message?.subject).toBe("Flora - Conclua seu cadastro");
    expect(message?.text).toContain("https://app.test/convite/");
  });

  it("reuses and resends an existing pending invitation for the same email", async () => {
    const { useCase, invitationRepository } = setup();

    await useCase.execute({ organizationId: "org-1", email: "dup@flora.local", roleId: "role-1" });
    await useCase.execute({ organizationId: "org-1", email: "dup@flora.local", roleId: "role-1" });

    expect(invitationRepository.invitations.size).toBe(1);
    expect(invitationRepository.createCalls).toBe(1);
    expect(invitationRepository.saveCalls).toBe(1);
  });

  it("rejects an unknown role", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ organizationId: "org-1", email: "x@flora.local", roleId: "missing" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects inviting to a full-access role", async () => {
    const { useCase } = setup({ fullAccessRole: true });

    await expect(
      useCase.execute({ organizationId: "org-1", email: "x@flora.local", roleId: "role-1" }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });
});
