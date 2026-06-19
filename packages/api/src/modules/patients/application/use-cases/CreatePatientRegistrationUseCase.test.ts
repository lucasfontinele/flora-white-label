import { describe, expect, it } from "vitest";
import {
  CreatePatientRegistrationUseCase,
  type CreatePatientRegistrationInput,
} from "./CreatePatientRegistrationUseCase.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import type { User } from "../../../users/domain/entities/User.js";
import type { Email } from "../../../users/domain/value-objects/Email.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import type { GuardianRepository } from "../../../guardians/application/repositories/GuardianRepository.js";
import type { Guardian } from "../../../guardians/domain/entities/Guardian.js";
import type { PatientRepository } from "../repositories/PatientRepository.js";
import type { Patient } from "../../domain/entities/Patient.js";
import type { PatientAssessmentRepository } from "../repositories/PatientAssessmentRepository.js";
import type { PatientAssessment } from "../../domain/entities/PatientAssessment.js";

// Two distinct, arithmetically valid CPFs used across the scenarios.
const PATIENT_CPF = "111.444.777-35";
const OTHER_CPF = "529.982.247-25";

class InMemoryUserRepository implements UserRepository {
  readonly users: User[] = [];

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

class InMemoryGuardianRepository implements GuardianRepository {
  readonly guardians: Guardian[] = [];

  async findByDocument(organizationId: string, document: Document): Promise<Guardian | null> {
    return (
      this.guardians.find(
        (guardian) =>
          guardian.organizationId === organizationId &&
          guardian.document.value === document.value,
      ) ?? null
    );
  }

  async create(guardian: Guardian): Promise<void> {
    this.guardians.push(guardian);
  }
}

class InMemoryPatientRepository implements PatientRepository {
  readonly patients: Patient[] = [];

  async findByDocument(organizationId: string, document: Document): Promise<Patient | null> {
    return (
      this.patients.find(
        (patient) =>
          patient.organizationId === organizationId &&
          patient.document.value === document.value,
      ) ?? null
    );
  }

  async create(patient: Patient): Promise<void> {
    this.patients.push(patient);
  }
}

class InMemoryPatientAssessmentRepository implements PatientAssessmentRepository {
  readonly assessments: PatientAssessment[] = [];

  async create(assessment: PatientAssessment): Promise<void> {
    this.assessments.push(assessment);
  }
}

class FakeHashService implements HashService {
  async hash(value: string): Promise<string> {
    return `hashed:${value}`;
  }

  async verify(hash: string, value: string): Promise<boolean> {
    return hash === `hashed:${value}`;
  }
}

const immediateUnitOfWork: UnitOfWork = {
  execute: (work) => work(),
};

function makeSut() {
  const userRepository = new InMemoryUserRepository();
  const guardianRepository = new InMemoryGuardianRepository();
  const patientRepository = new InMemoryPatientRepository();
  const patientAssessmentRepository = new InMemoryPatientAssessmentRepository();

  const useCase = new CreatePatientRegistrationUseCase({
    userRepository,
    guardianRepository,
    patientRepository,
    patientAssessmentRepository,
    hashService: new FakeHashService(),
    unitOfWork: immediateUnitOfWork,
  });

  return {
    useCase,
    userRepository,
    guardianRepository,
    patientRepository,
    patientAssessmentRepository,
  };
}

function first<T>(items: readonly T[]): T {
  const [item] = items;
  if (item === undefined) {
    throw new Error("Expected at least one item but the collection was empty.");
  }
  return item;
}

function selfResponsibleInput(
  overrides: Partial<CreatePatientRegistrationInput["patient"]> = {},
  email = "patient@example.com",
): CreatePatientRegistrationInput {
  return {
    organizationId: "org-1",
    user: { email, password: "secret123", profile: "Patient" },
    patient: {
      name: "Alice Doe",
      document: PATIENT_CPF,
      birthdate: "1990-05-10",
      gender: "F",
      underPrivileged: false,
      isSelfResponsible: true,
      ...overrides,
    },
  };
}

describe("CreatePatientRegistrationUseCase", () => {
  it("creates a self-responsible patient without a guardian when isSelfResponsible is true", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute(selfResponsibleInput());

    expect(sut.guardianRepository.guardians).toHaveLength(0);
    expect(output.guardianId).toBeUndefined();

    const patient = first(sut.patientRepository.patients);
    expect(patient.guardianId).toBeUndefined();

    const user = first(sut.userRepository.users);
    expect(user.profile).toBe(UserProfile.Patient);
    expect(user.guardianId).toBeUndefined();
    expect(user.patientId).toBe(patient.id);
  });

  it("uses the provided guardian data when isSelfResponsible is false", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute({
      organizationId: "org-1",
      user: { email: "tutor@example.com", password: "secret123", profile: "Guardian" },
      guardian: {
        name: "Bob Tutor",
        document: OTHER_CPF,
        birthdate: "1970-02-02",
        gender: "M",
      },
      patient: {
        name: "Alice Doe",
        document: PATIENT_CPF,
        birthdate: "2010-05-10",
        gender: "F",
        underPrivileged: false,
        isSelfResponsible: false,
      },
    });

    const guardian = first(sut.guardianRepository.guardians);
    expect(guardian.name).toBe("Bob Tutor");
    expect(guardian.document.value).toBe("52998224725");
    expect(output.guardianId).toBe(guardian.id);

    const patient = first(sut.patientRepository.patients);
    const user = first(sut.userRepository.users);
    expect(user.profile).toBe(UserProfile.Guardian);
    expect(user.guardianId).toBe(guardian.id);
    expect(user.patientId).toBeUndefined();
    expect(patient.guardianId).toBe(guardian.id);
  });

  it("creates a PatientAssessment when underPrivileged is true and a guardian exists", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute({
      organizationId: "org-1",
      user: { email: "tutor-assessment@example.com", password: "secret123", profile: "Guardian" },
      guardian: {
        name: "Bob Tutor",
        document: OTHER_CPF,
        birthdate: "1970-02-02",
        gender: "M",
      },
      patient: {
        name: "Alice Doe",
        document: PATIENT_CPF,
        birthdate: "2010-05-10",
        gender: "F",
        underPrivileged: true,
        isSelfResponsible: false,
      },
    });

    expect(sut.patientAssessmentRepository.assessments).toHaveLength(1);
    const assessment = first(sut.patientAssessmentRepository.assessments);
    expect(assessment.isApproved).toBe(false);
    expect(assessment.approvedAt).toBeNull();
    expect(output.patientAssessmentId).toBe(assessment.id);
  });

  it("does not create a PatientAssessment for an under-privileged self-responsible patient without guardian", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute(selfResponsibleInput({ underPrivileged: true }));

    expect(sut.guardianRepository.guardians).toHaveLength(0);
    expect(sut.patientAssessmentRepository.assessments).toHaveLength(0);
    expect(output.guardianId).toBeUndefined();
    expect(output.patientAssessmentId).toBeUndefined();
  });

  it("does not create a PatientAssessment when underPrivileged is false", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute(selfResponsibleInput({ underPrivileged: false }));

    expect(sut.patientAssessmentRepository.assessments).toHaveLength(0);
    expect(output.patientAssessmentId).toBeUndefined();
  });

  it("fails when the e-mail already exists", async () => {
    const sut = makeSut();
    await sut.useCase.execute(selfResponsibleInput({}, "dup@example.com"));

    await expect(
      sut.useCase.execute(
        selfResponsibleInput({ document: OTHER_CPF }, "dup@example.com"),
      ),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("fails when the patient document already exists in the organization", async () => {
    const sut = makeSut();
    await sut.useCase.execute(selfResponsibleInput({}, "first@example.com"));

    await expect(
      sut.useCase.execute(selfResponsibleInput({}, "second@example.com")),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
