import { describe, expect, it } from "vitest";
import { AuthenticationError } from "../../../../shared/application/errors/AuthenticationError.js";
import { ForbiddenError } from "../../../../shared/application/errors/ForbiddenError.js";
import type {
  AuthenticatedUserContext,
  AuthenticatedUserContextRepository,
} from "../../../users/application/repositories/AuthenticatedUserContextRepository.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import { User } from "../../../users/domain/entities/User.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import { Email } from "../../../users/domain/value-objects/Email.js";
import { PasswordHash } from "../../../users/domain/value-objects/PasswordHash.js";
import { GetMeUseCase, type PatientStatusRefresher } from "./GetMeUseCase.js";

class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: User[]) {}
  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
  async findByEmail(): Promise<User | null> {
    return null;
  }
  async findByEmailInOrganization(): Promise<User | null> {
    return null;
  }
  async create(): Promise<void> {}
  async save(): Promise<void> {}
}

class InMemoryContextRepository implements AuthenticatedUserContextRepository {
  constructor(private readonly contexts: AuthenticatedUserContext[]) {}
  async findByUserId(userId: string): Promise<AuthenticatedUserContext | null> {
    return this.contexts.find((context) => context.user.id === userId) ?? null;
  }
}

class SpyRefresher implements PatientStatusRefresher {
  readonly calls: Array<{ organizationId: string; patientId: string }> = [];
  async execute(input: { organizationId: string; patientId: string }): Promise<unknown> {
    this.calls.push(input);
    return { changed: false };
  }
}

function patient(id: string) {
  return {
    id,
    name: `Paciente ${id}`,
    document: "52998224725",
    underPrivileged: false,
    patientStatus: "APPROVAL" as const,
  };
}

function makeUser(profile: UserProfile, overrides?: { isActive?: boolean }) {
  return User.create(
    {
      organizationId: "org-1",
      email: Email.create(`${profile.toLowerCase()}@example.com`),
      passwordHash: PasswordHash.fromHash("hashed-password"),
      profile,
      guardianId: profile === UserProfile.Guardian ? "guardian-1" : undefined,
      patientId: profile === UserProfile.Patient ? "patient-1" : undefined,
      isActive: overrides?.isActive ?? true,
    },
    `user-${profile}`,
  );
}

describe("GetMeUseCase", () => {
  it("refreshes the self patient and returns the assembled context", async () => {
    const user = makeUser(UserProfile.Patient);
    const context: AuthenticatedUserContext = {
      user: {
        id: user.id,
        email: user.email.value,
        profile: user.profile,
        organizationId: user.organizationId,
        patientId: user.patientId,
      },
      patient: patient("patient-1"),
      managedPatients: [],
    };
    const refresher = new SpyRefresher();
    const useCase = new GetMeUseCase({
      userRepository: new InMemoryUserRepository([user]),
      contextRepository: new InMemoryContextRepository([context]),
      patientStatusRefresher: refresher,
    });

    const result = await useCase.execute({ userId: user.id });

    expect(refresher.calls).toEqual([{ organizationId: "org-1", patientId: "patient-1" }]);
    expect(result.context.patient?.id).toBe("patient-1");
    expect(result.user.id).toBe(user.id);
  });

  it("refreshes every managed patient of a guardian", async () => {
    const user = makeUser(UserProfile.Guardian);
    const context: AuthenticatedUserContext = {
      user: {
        id: user.id,
        email: user.email.value,
        profile: user.profile,
        organizationId: user.organizationId,
        guardianId: user.guardianId,
      },
      managedPatients: [patient("patient-1"), patient("patient-2")],
    };
    const refresher = new SpyRefresher();
    const useCase = new GetMeUseCase({
      userRepository: new InMemoryUserRepository([user]),
      contextRepository: new InMemoryContextRepository([context]),
      patientStatusRefresher: refresher,
    });

    const result = await useCase.execute({ userId: user.id });

    expect(refresher.calls.map((call) => call.patientId).sort()).toEqual(["patient-1", "patient-2"]);
    expect(result.context.managedPatients).toHaveLength(2);
  });

  it("rejects an unknown user", async () => {
    const useCase = new GetMeUseCase({
      userRepository: new InMemoryUserRepository([]),
      contextRepository: new InMemoryContextRepository([]),
      patientStatusRefresher: new SpyRefresher(),
    });

    await expect(useCase.execute({ userId: "missing" })).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("rejects an inactive user", async () => {
    const user = makeUser(UserProfile.Patient, { isActive: false });
    const useCase = new GetMeUseCase({
      userRepository: new InMemoryUserRepository([user]),
      contextRepository: new InMemoryContextRepository([]),
      patientStatusRefresher: new SpyRefresher(),
    });

    await expect(useCase.execute({ userId: user.id })).rejects.toBeInstanceOf(ForbiddenError);
  });
});
