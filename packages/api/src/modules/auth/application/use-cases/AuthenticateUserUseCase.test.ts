import { describe, expect, it } from "vitest";
import { AuthenticationError } from "../../../../shared/application/errors/AuthenticationError.js";
import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import type { JwtPayload, JwtService } from "../../../../shared/application/tokens/JwtService.js";
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
      guardianId:
        profile === UserProfile.Guardian || profile === UserProfile.Patient
          ? "guardian-1"
          : undefined,
      patientId: profile === UserProfile.Patient ? "patient-1" : undefined,
    },
    id,
  );
}

function makeSut(options: { users?: User[]; passwordMatches?: boolean } = {}) {
  const userRepository = new InMemoryUserRepository(options.users ?? [makeUser(UserProfile.Master)]);
  const hashService = new TrackingHashService(options.passwordMatches ?? true);
  const jwtService = new TrackingJwtService();
  const useCase = new AuthenticateUserUseCase({
    userRepository,
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
      },
    });
    expect(JSON.stringify(output)).not.toContain("passwordHash");
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
