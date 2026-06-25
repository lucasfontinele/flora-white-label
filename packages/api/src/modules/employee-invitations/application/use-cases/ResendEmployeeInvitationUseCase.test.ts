import { describe, expect, it } from "vitest";
import { ResendEmployeeInvitationUseCase } from "./ResendEmployeeInvitationUseCase.js";
import {
  FakeEmailService,
  InMemoryEmployeeInvitationRepository,
  immediateUnitOfWork,
} from "./employee-invitation-test-utils.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { EmployeeInvitation } from "../../domain/entities/EmployeeInvitation.js";

function setup() {
  const invitationRepository = new InMemoryEmployeeInvitationRepository();
  const emailService = new FakeEmailService();
  const invitation = EmployeeInvitation.create({
    organizationId: "org-1",
    email: "person@flora.local",
    roleId: "role-1",
  });
  invitationRepository.seed(invitation);

  const useCase = new ResendEmployeeInvitationUseCase({
    invitationRepository,
    emailService,
    unitOfWork: immediateUnitOfWork,
    webAppUrl: "https://app.test",
  });

  return { useCase, invitation, invitationRepository, emailService };
}

describe("ResendEmployeeInvitationUseCase", () => {
  it("regenerates the token and re-sends the e-mail", async () => {
    const { useCase, invitation, emailService } = setup();
    const firstToken = invitation.token;

    const result = await useCase.execute({ organizationId: "org-1", invitationId: invitation.id });

    expect(result.status).toBe("PENDING");
    expect(invitation.token).not.toBe(firstToken);
    expect(emailService.sent).toHaveLength(1);
    expect(emailService.sent[0]?.text).toContain(invitation.token);
  });

  it("rejects an unknown invitation", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ organizationId: "org-1", invitationId: "missing" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects resending an accepted invitation", async () => {
    const { useCase, invitation } = setup();
    invitation.accept();

    await expect(
      useCase.execute({ organizationId: "org-1", invitationId: invitation.id }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });
});
