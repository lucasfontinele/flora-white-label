import { describe, expect, it } from "vitest";
import { AcceptEmployeeInvitationUseCase } from "./AcceptEmployeeInvitationUseCase.js";
import {
  FakeHashService,
  FakeOrganizationEmployeeRepository,
  FakeUserRepository,
  InMemoryEmployeeInvitationRepository,
  immediateUnitOfWork,
} from "./employee-invitation-test-utils.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import { EmployeeInvitation } from "../../domain/entities/EmployeeInvitation.js";
import { InvitationStatus } from "../../domain/enums/InvitationStatus.js";

// Valid CPF (passes the check-digit algorithm).
const VALID_CPF = "39053344705";

function setup() {
  const invitationRepository = new InMemoryEmployeeInvitationRepository();
  const organizationEmployeeRepository = new FakeOrganizationEmployeeRepository();
  const userRepository = new FakeUserRepository();
  const invitation = EmployeeInvitation.create({
    organizationId: "org-1",
    email: "person@flora.local",
    roleId: "role-1",
  });
  invitationRepository.seed(invitation);

  const useCase = new AcceptEmployeeInvitationUseCase({
    invitationRepository,
    organizationEmployeeRepository,
    userRepository,
    hashService: new FakeHashService(),
    unitOfWork: immediateUnitOfWork,
  });

  return { useCase, invitation, invitationRepository, organizationEmployeeRepository, userRepository };
}

describe("AcceptEmployeeInvitationUseCase", () => {
  it("creates the employee + user and marks the invitation accepted", async () => {
    const { useCase, invitation, organizationEmployeeRepository, userRepository } = setup();

    const result = await useCase.execute({
      token: invitation.token,
      fullName: "Maria Souza",
      document: VALID_CPF,
      password: "Str0ngPass!",
    });

    expect(result.email).toBe("person@flora.local");
    expect(organizationEmployeeRepository.created).toHaveLength(1);
    expect(organizationEmployeeRepository.created[0]?.roleId).toBe("role-1");
    expect(userRepository.created).toHaveLength(1);
    expect(userRepository.created[0]?.profile).toBe(UserProfile.Organization);
    expect(userRepository.created[0]?.organizationEmployeeId).toBe(result.organizationEmployeeId);
    expect(invitation.status).toBe(InvitationStatus.Accepted);
  });

  it("rejects an unknown token", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ token: "nope", fullName: "X", document: VALID_CPF, password: "Str0ngPass!" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects an invalid CPF", async () => {
    const { useCase, invitation } = setup();

    await expect(
      useCase.execute({
        token: invitation.token,
        fullName: "X",
        document: "11111111111",
        password: "Str0ngPass!",
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });

  it("rejects when a user with the e-mail already exists", async () => {
    const { useCase, invitation, userRepository } = setup();
    // Mark the email as taken.
    userRepository.findByEmailInOrganization = async () => ({}) as never;

    await expect(
      useCase.execute({
        token: invitation.token,
        fullName: "X",
        document: VALID_CPF,
        password: "Str0ngPass!",
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects accepting an expired invitation", async () => {
    const invitationRepository = new InMemoryEmployeeInvitationRepository();
    const expired = EmployeeInvitation.restore(
      {
        organizationId: "org-1",
        email: "person@flora.local",
        roleId: "role-1",
        token: "expired-token",
        status: InvitationStatus.Pending,
        expiresAt: new Date(Date.now() - 1000),
        acceptedAt: null,
        invitedByUserId: null,
      },
      "inv-1",
    );
    invitationRepository.seed(expired);

    const useCase = new AcceptEmployeeInvitationUseCase({
      invitationRepository,
      organizationEmployeeRepository: new FakeOrganizationEmployeeRepository(),
      userRepository: new FakeUserRepository(),
      hashService: new FakeHashService(),
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({
        token: "expired-token",
        fullName: "X",
        document: VALID_CPF,
        password: "Str0ngPass!",
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });
});
