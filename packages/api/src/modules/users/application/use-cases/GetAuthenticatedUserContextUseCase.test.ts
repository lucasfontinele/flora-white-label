import { describe, expect, it } from "vitest";
import { UserProfile } from "../../domain/enums/UserProfile.js";
import type {
  AuthenticatedUserContext,
  AuthenticatedUserContextRepository,
} from "../repositories/AuthenticatedUserContextRepository.js";
import { GetAuthenticatedUserContextUseCase } from "./GetAuthenticatedUserContextUseCase.js";

class InMemoryAuthenticatedUserContextRepository implements AuthenticatedUserContextRepository {
  constructor(private readonly contexts: AuthenticatedUserContext[]) {}

  async findByUserId(userId: string): Promise<AuthenticatedUserContext | null> {
    return this.contexts.find((context) => context.user.id === userId) ?? null;
  }
}

function makeUseCase(context: AuthenticatedUserContext): GetAuthenticatedUserContextUseCase {
  return new GetAuthenticatedUserContextUseCase({
    contextRepository: new InMemoryAuthenticatedUserContextRepository([context]),
  });
}

const guardianOnlyContext: AuthenticatedUserContext = {
  user: {
    id: "user-1",
    email: "guardian@example.com",
    profile: UserProfile.Guardian,
    organizationId: "org-1",
    guardianId: "guardian-1",
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
};

describe("GetAuthenticatedUserContextUseCase", () => {
  it("returns all patients managed by the linked guardian", async () => {
    const useCase = makeUseCase(guardianOnlyContext);

    const output = await useCase.execute({ userId: "user-1" });

    expect(output.managedPatients).toHaveLength(2);
    expect(output.managedPatients.map((patient) => patient.id)).toEqual([
      "patient-1",
      "patient-2",
    ]);
    expect(output.activePatient?.id).toBe("patient-1");
    expect(output.managedPatients[0]?.isActive).toBe(true);
  });

  it("returns canBecomePatient when the user has a guardian but no patient", async () => {
    const useCase = makeUseCase(guardianOnlyContext);

    const output = await useCase.execute({ userId: "user-1" });

    expect(output.capabilities.canManagePatients).toBe(true);
    expect(output.capabilities.canBecomePatient).toBe(true);
    expect(output.capabilities.isPatient).toBe(false);
  });

  it("returns isPatient and uses user.patientId as the active patient", async () => {
    const useCase = makeUseCase({
      ...guardianOnlyContext,
      user: {
        ...guardianOnlyContext.user,
        profile: UserProfile.Patient,
        patientId: "patient-2",
      },
      patient: {
        id: "patient-2",
        name: "Charlie Doe",
        document: "93541134780",
        underPrivileged: true,
      },
    });

    const output = await useCase.execute({ userId: "user-1" });

    expect(output.capabilities.canManagePatients).toBe(true);
    expect(output.capabilities.canBecomePatient).toBe(false);
    expect(output.capabilities.isPatient).toBe(true);
    expect(output.activePatient?.id).toBe("patient-2");
    expect(output.activePatient?.relationshipLabel).toBe("Titular");
    expect(output.managedPatients[1]?.isActive).toBe(true);
  });
});
