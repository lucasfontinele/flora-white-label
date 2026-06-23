import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { User } from "../../domain/entities/User.js";
import { UserProfile } from "../../domain/enums/UserProfile.js";
import { Email } from "../../domain/value-objects/Email.js";
import { PasswordHash } from "../../domain/value-objects/PasswordHash.js";
import type { UserRepository } from "../repositories/UserRepository.js";
import { SetUserAccessUseCase } from "./SetUserAccessUseCase.js";

const immediateUnitOfWork: UnitOfWork = { execute: <T>(work: () => Promise<T>) => work() };

class InMemoryUserRepository implements UserRepository {
  constructor(readonly users: User[]) {}

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(): Promise<User | null> {
    throw new Error("not implemented");
  }

  async findByEmailInOrganization(): Promise<User | null> {
    throw new Error("not implemented");
  }

  async create(): Promise<void> {
    throw new Error("not implemented");
  }

  async save(user: User): Promise<void> {
    const index = this.users.findIndex((item) => item.id === user.id);
    if (index >= 0) this.users[index] = user;
  }
}

function makeUser(id: string, profile: UserProfile): User {
  return User.create(
    {
      organizationId: "org-1",
      email: Email.create(`${id}@example.com`),
      passwordHash: PasswordHash.fromHash("hashed"),
      profile,
      guardianId: profile === UserProfile.Guardian ? "guardian-1" : undefined,
      patientId: profile === UserProfile.Patient ? "patient-1" : undefined,
    },
    id,
  );
}

describe("SetUserAccessUseCase", () => {
  it("disables and re-enables an associate's access", async () => {
    const user = makeUser("u-1", UserProfile.Patient);
    const repository = new InMemoryUserRepository([user]);
    const useCase = new SetUserAccessUseCase({
      userRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    const disabled = await useCase.execute({ organizationId: "org-1", userId: "u-1", isActive: false });
    expect(disabled).toEqual({ userId: "u-1", isActive: false });
    expect(repository.users[0]?.isActive).toBe(false);

    const enabled = await useCase.execute({ organizationId: "org-1", userId: "u-1", isActive: true });
    expect(enabled.isActive).toBe(true);
    expect(repository.users[0]?.isActive).toBe(true);
  });

  it("fails for a user outside the organization", async () => {
    const repository = new InMemoryUserRepository([makeUser("u-1", UserProfile.Guardian)]);
    const useCase = new SetUserAccessUseCase({
      userRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({ organizationId: "org-2", userId: "u-1", isActive: false }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("refuses to toggle a non-associate (organization staff)", async () => {
    const repository = new InMemoryUserRepository([makeUser("u-1", UserProfile.Organization)]);
    const useCase = new SetUserAccessUseCase({
      userRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({ organizationId: "org-1", userId: "u-1", isActive: false }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
