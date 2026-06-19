import { describe, expect, it } from "vitest";
import { AuthenticationError } from "../../../../shared/application/errors/AuthenticationError.js";
import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import type { JwtPayload, JwtService } from "../../../../shared/application/tokens/JwtService.js";
import type {
  AuthenticatedUserContext,
  AuthenticatedUserContextRepository,
} from "../../../users/application/repositories/AuthenticatedUserContextRepository.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import { User } from "../../../users/domain/entities/User.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import { Email } from "../../../users/domain/value-objects/Email.js";
import { PasswordHash } from "../../../users/domain/value-objects/PasswordHash.js";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase.js";

class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: User[]) {}

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((user) => user.email.value === email.value) ?? null;
  }

  async findByEmailInOrganization(organizationId: string, email: Email): Promise<User | null> {
    return (
      this.users.find(
        (user) => user.organizationId === organizationId && user.email.value === email.value,
      ) ?? null
    );
  }

  async create(user: User): Promise<void> {
    this.users.push(user);
  }

  async save(user: User): Promise<void> {
    const index = this.users.findIndex((item) => item.id === user.id);
    if (index >= 0) {
      this.users[index] = user;
    }
  }
}

class InMemoryAuthenticatedUserContextRepository implements AuthenticatedUserContextRepository {
  constructor(private readonly contexts: AuthenticatedUserContext[]) {}

  async findByUserId(userId: string): Promise<AuthenticatedUserContext | null> {
    return this.contexts.find((context) => context.user.id === userId) ?? null;
  }
}

class TrackingHashService implements HashService {
  readonly verifyCalls: Array<{ hash: string; value: string }> = [];

  constructor(private readonly matches: boolean) {}

  async hash(value: string): Promise<string> {
    return `hashed:${value}`;
  }

  async verify(hash: string, value: string): Promise<boolean> {
    this.verifyCalls.push({ hash, value });
    return this.matches;
  }
}

class TrackingJwtService implements JwtService {
  readonly signCalls: JwtPayload[] = [];

  async sign(payload: JwtPayload): Promise<string> {
    this.signCalls.push(payload);
    return "signed-access-token";
  }

  async verify<TPayload extends JwtPayload = JwtPayload>(): Promise<TPayload> {
    throw new Error("Not implemented for this test.");
  }
}

function makeUser(profile: UserProfile, id = `user-${profile}`): User {
  return User.create(
    {
      organizationId: "org-1",
      email: Email.create(`${profile.toLowerCase()}@example.com`),
      passwordHash: PasswordHash.fromHash("hashed-password"),
      profile,
      guardianId: profile === UserProfile.Guardian ? "guardian-1" : undefined,
      patientId: profile === UserProfile.Patient ? "patient-1" : undefined,
    },
    id,
  );
}

function toAuthenticatedContext(user: User): AuthenticatedUserContext {
  return {
    user: {
      id: user.id,
      email: user.email.value,
      profile: user.profile,
      organizationId: user.organizationId,
      guardianId: user.guardianId,
      patientId: user.patientId,
    },
    managedPatients: [],
  };
}

function makeSut(
  options: {
    users?: User[];
    contexts?: AuthenticatedUserContext[];
    passwordMatches?: boolean;
  } = {},
) {
  const userRepository = new InMemoryUserRepository(options.users ?? [makeUser(UserProfile.Master)]);
  const contextRepository = new InMemoryAuthenticatedUserContextRepository(
    options.contexts ?? (options.users ?? [makeUser(UserProfile.Master)]).map(toAuthenticatedContext),
  );
  const hashService = new TrackingHashService(options.passwordMatches ?? true);
  const jwtService = new TrackingJwtService();
  const useCase = new AuthenticateUserUseCase({
    userRepository,
    contextRepository,
    hashService,
    jwtService,
  });

  return {
    useCase,
    hashService,
    jwtService,
  };
}

describe("AuthenticateUserUseCase", () => {
  it.each([
    [UserProfile.Master, "BackofficeMaster"],
    [UserProfile.Organization, "Organization"],
    [UserProfile.Guardian, "PatientPortal"],
    [UserProfile.Patient, "PatientPortal"],
  ] as const)("authenticates %s users and returns the derived view", async (profile, view) => {
    const user = makeUser(profile);
    const sut = makeSut({ users: [user] });

    const output = await sut.useCase.execute({
      email: `  ${user.email.value.toUpperCase()}  `,
      password: "secret",
    });

    expect(sut.hashService.verifyCalls).toEqual([
      {
        hash: "hashed-password",
        value: "secret",
      },
    ]);
    expect(sut.jwtService.signCalls).toEqual([
      {
        sub: user.id,
        email: user.email.value,
        profile,
        organizationId: "org-1",
        guardianId: user.guardianId ?? null,
        patientId: user.patientId ?? null,
      },
    ]);
    expect(output).toEqual({
      accessToken: "signed-access-token",
      user: {
        id: user.id,
        email: user.email.value,
        profile,
        organizationId: "org-1",
        guardianId: user.guardianId ?? null,
        patientId: user.patientId ?? null,
      },
      context: {
        view,
        organizationId: "org-1",
        guardianId: user.guardianId ?? null,
        patientId: user.patientId ?? null,
        guardian: null,
        patient: null,
        managedPatients: [],
      },
    });
    expect(JSON.stringify(output)).not.toContain("passwordHash");
  });

  it("returns guardian data and managed patients when the authenticated user is a Guardian", async () => {
    const user = makeUser(UserProfile.Guardian);
    const sut = makeSut({
      users: [user],
      contexts: [
        {
          user: {
            id: user.id,
            email: user.email.value,
            profile: user.profile,
            organizationId: user.organizationId,
            guardianId: user.guardianId,
          },
          guardian: {
            id: "guardian-1",
            name: "Bob Tutor",
            document: "52998224725",
          },
          managedPatients: [
            {
              id: "patient-1",
              name: "Alice Doe",
              document: "11144477735",
              underPrivileged: false,
            },
            {
              id: "patient-2",
              name: "Charlie Doe",
              document: "93541134780",
              underPrivileged: true,
            },
          ],
        },
      ],
    });

    const output = await sut.useCase.execute({
      email: user.email.value,
      password: "secret",
    });

    expect(output.context.guardian).toEqual({
      id: "guardian-1",
      name: "Bob Tutor",
      document: "52998224725",
    });
    expect(output.context.patient).toBeNull();
    expect(output.context.managedPatients).toEqual([
      {
        id: "patient-1",
        name: "Alice Doe",
        document: "11144477735",
        relationshipLabel: "Paciente vinculado",
        underPrivileged: false,
      },
      {
        id: "patient-2",
        name: "Charlie Doe",
        document: "93541134780",
        relationshipLabel: "Paciente vinculado",
        underPrivileged: true,
      },
    ]);
  });

  it("returns only the authenticated patient data when the user is a Patient", async () => {
    const user = User.create(
      {
        organizationId: "org-1",
        email: Email.create("patient@example.com"),
        passwordHash: PasswordHash.fromHash("hashed-password"),
        profile: UserProfile.Patient,
        guardianId: "guardian-1",
        patientId: "patient-1",
      },
      "user-Patient",
    );
    const sut = makeSut({
      users: [user],
      contexts: [
        {
          user: {
            id: user.id,
            email: user.email.value,
            profile: user.profile,
            organizationId: user.organizationId,
            guardianId: "guardian-1",
            patientId: "patient-1",
          },
          guardian: {
            id: "guardian-1",
            name: "Bob Tutor",
            document: "52998224725",
          },
          patient: {
            id: "patient-1",
            name: "Alice Doe",
            document: "11144477735",
            underPrivileged: false,
          },
          managedPatients: [
            {
              id: "patient-1",
              name: "Alice Doe",
              document: "11144477735",
              underPrivileged: false,
            },
            {
              id: "patient-2",
              name: "Charlie Doe",
              document: "93541134780",
              underPrivileged: true,
            },
          ],
        },
      ],
    });

    const output = await sut.useCase.execute({
      email: user.email.value,
      password: "secret",
    });

    expect(output.user.guardianId).toBeNull();
    expect(output.context.guardianId).toBeNull();
    expect(output.context.guardian).toBeNull();
    expect(output.context.patient).toEqual({
      id: "patient-1",
      name: "Alice Doe",
      document: "11144477735",
      relationshipLabel: "Titular",
      underPrivileged: false,
    });
    expect(output.context.managedPatients).toEqual([]);
  });

  it("throws a generic AuthenticationError when the email is unknown", async () => {
    const sut = makeSut({ users: [] });

    await expect(
      sut.useCase.execute({ email: "unknown@example.com", password: "secret" }),
    ).rejects.toEqual(new AuthenticationError());

    expect(sut.hashService.verifyCalls).toHaveLength(0);
    expect(sut.jwtService.signCalls).toHaveLength(0);
  });

  it("throws a generic AuthenticationError when the password does not match", async () => {
    const sut = makeSut({ passwordMatches: false });

    await expect(
      sut.useCase.execute({ email: "master@example.com", password: "wrong" }),
    ).rejects.toEqual(new AuthenticationError());

    expect(sut.hashService.verifyCalls).toHaveLength(1);
    expect(sut.jwtService.signCalls).toHaveLength(0);
  });
});
