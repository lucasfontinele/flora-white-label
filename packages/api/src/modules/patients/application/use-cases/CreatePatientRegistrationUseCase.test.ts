import { describe, expect, it } from "vitest";
import {
  CreatePatientRegistrationUseCase,
  type CreatePatientRegistrationInput,
  type PatientRegistrationPatientInput,
} from "./CreatePatientRegistrationUseCase.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { GuardianRepository } from "../../../guardians/application/repositories/GuardianRepository.js";
import type { Guardian } from "../../../guardians/domain/entities/Guardian.js";
import type {
  OrganizationPublicReadModel,
  OrganizationReadModel,
  OrganizationRepository,
} from "../../../organizations/application/repositories/OrganizationRepository.js";
import { Organization } from "../../../organizations/domain/entities/Organization.js";
import { Cnae } from "../../../organizations/domain/value-objects/Cnae.js";
import { Cnpj } from "../../../organizations/domain/value-objects/Cnpj.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import type { User } from "../../../users/domain/entities/User.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import type { Email } from "../../../users/domain/value-objects/Email.js";
import type { PatientRepository } from "../repositories/PatientRepository.js";
import type { Patient } from "../../domain/entities/Patient.js";
import { RegistrationType } from "../../domain/enums/RegistrationType.js";

const PATIENT_CPF = "111.444.777-35";
const GUARDIAN_CPF = "529.982.247-25";
const OTHER_CPF = "935.411.347-80";

class TrackingUnitOfWork implements UnitOfWork {
  executions = 0;
  inTransaction = false;

  async execute<T>(work: () => Promise<T>): Promise<T> {
    this.executions += 1;
    this.inTransaction = true;
    try {
      return await work();
    } finally {
      this.inTransaction = false;
    }
  }
}

class InMemoryOrganizationRepository implements OrganizationRepository {
  readonly organizations: Organization[] = [
    Organization.create({
      slug: "org",
      tradeName: "Org",
      legalName: "Org Legal",
      cnpj: Cnpj.create("11222333000181"),
      primaryCnae: Cnae.create("1234567"),
      secondaryCnaes: [],
      currentPlanId: "plan-1",
      addressId: "address-1",
    }, "org-1"),
  ];

  async findByCnpj(cnpj: Cnpj): Promise<Organization | null> {
    return this.organizations.find((organization) => organization.cnpj.equals(cnpj)) ?? null;
  }

  async findByCnpjExcludingId(cnpj: Cnpj, id: string): Promise<Organization | null> {
    return (
      this.organizations.find(
        (organization) => organization.id !== id && organization.cnpj.equals(cnpj),
      ) ?? null
    );
  }

  async findById(id: string): Promise<Organization | null> {
    return this.organizations.find((organization) => organization.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<OrganizationPublicReadModel | null> {
    const organization = this.organizations.find((current) => current.slug === slug);

    return organization
      ? { id: organization.id, tradeName: organization.tradeName, slug: organization.slug, settings: null }
      : null;
  }

  async findDetailsById(): Promise<OrganizationReadModel | null> {
    return null;
  }

  async findAllDetails(): Promise<OrganizationReadModel[]> {
    return [];
  }

  async create(organization: Organization): Promise<void> {
    this.organizations.push(organization);
  }

  async save(organization: Organization): Promise<void> {
    const index = this.organizations.findIndex((item) => item.id === organization.id);
    if (index >= 0) {
      this.organizations[index] = organization;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.organizations.findIndex((organization) => organization.id === id);
    if (index >= 0) {
      this.organizations.splice(index, 1);
    }
  }
}

class InMemoryUserRepository implements UserRepository {
  readonly users: User[] = [];

  constructor(private readonly unitOfWork: TrackingUnitOfWork) {}

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
    expect(this.unitOfWork.inTransaction).toBe(true);
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

  constructor(private readonly unitOfWork: TrackingUnitOfWork) {}

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
    expect(this.unitOfWork.inTransaction).toBe(true);
    this.guardians.push(guardian);
  }
}

class InMemoryPatientRepository implements PatientRepository {
  readonly patients: Patient[] = [];

  constructor(private readonly unitOfWork: TrackingUnitOfWork) {}

  async findByIdInOrganization(organizationId: string, patientId: string): Promise<Patient | null> {
    return (
      this.patients.find(
        (patient) => patient.organizationId === organizationId && patient.id === patientId,
      ) ?? null
    );
  }

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
    expect(this.unitOfWork.inTransaction).toBe(true);
    this.patients.push(patient);
  }
}

class FakeHashService implements HashService {
  readonly hashCalls: string[] = [];

  async hash(value: string): Promise<string> {
    this.hashCalls.push(value);
    return `hashed:${value}`;
  }

  async verify(hash: string, value: string): Promise<boolean> {
    return hash === `hashed:${value}`;
  }
}

function makeSut() {
  const unitOfWork = new TrackingUnitOfWork();
  const hashService = new FakeHashService();
  const organizationRepository = new InMemoryOrganizationRepository();
  const userRepository = new InMemoryUserRepository(unitOfWork);
  const guardianRepository = new InMemoryGuardianRepository(unitOfWork);
  const patientRepository = new InMemoryPatientRepository(unitOfWork);

  const useCase = new CreatePatientRegistrationUseCase({
    organizationRepository,
    userRepository,
    guardianRepository,
    patientRepository,
    hashService,
    unitOfWork,
  });

  return {
    useCase,
    hashService,
    unitOfWork,
    organizationRepository,
    userRepository,
    guardianRepository,
    patientRepository,
  };
}

function first<T>(items: readonly T[]): T {
  const [item] = items;
  if (item === undefined) {
    throw new Error("Expected at least one item but the collection was empty.");
  }
  return item;
}

function patientInput(
  overrides: Partial<PatientRegistrationPatientInput> = {},
  email = "patient@example.com",
): CreatePatientRegistrationInput {
  return {
    organizationId: "org-1",
    registrationType: RegistrationType.Patient,
    user: { email, password: "secret123" },
    patient: {
      name: "Alice Doe",
      document: PATIENT_CPF,
      birthdate: "1990-05-10",
      gender: "F",
      underPrivileged: false,
      ...overrides,
    },
  };
}

function legalGuardianInput(
  overrides: {
    patient?: Partial<Extract<CreatePatientRegistrationInput, {
      registrationType: RegistrationType.LegalGuardian;
    }>["patient"]>;
    guardian?: Partial<Extract<CreatePatientRegistrationInput, {
      registrationType: RegistrationType.LegalGuardian;
    }>["guardian"]>;
    email?: string;
  } = {},
): CreatePatientRegistrationInput {
  return {
    organizationId: "org-1",
    registrationType: RegistrationType.LegalGuardian,
    user: { email: overrides.email ?? "guardian@example.com", password: "secret123" },
    guardian: {
      name: "Bob Guardian",
      document: GUARDIAN_CPF,
      birthdate: "1970-02-02",
      gender: "M",
      ...overrides.guardian,
    },
    patient: {
      name: "Alice Doe",
      document: PATIENT_CPF,
      birthdate: "2010-05-10",
      gender: "F",
      underPrivileged: true,
      ...overrides.patient,
    },
  };
}

function petTutorInput(
  overrides: Partial<Extract<CreatePatientRegistrationInput, {
    registrationType: RegistrationType.PetTutor;
  }>["guardian"]> = {},
  email = "tutor@example.com",
): CreatePatientRegistrationInput {
  return {
    organizationId: "org-1",
    registrationType: RegistrationType.PetTutor,
    user: { email, password: "secret123" },
    guardian: {
      name: "Carol Tutor",
      document: GUARDIAN_CPF,
      birthdate: "1990-03-03",
      gender: "O",
      ...overrides,
    },
  };
}

describe("CreatePatientRegistrationUseCase", () => {
  it("creates User and Patient only for Patient registrations", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute(patientInput());

    expect(output.registrationType).toBe(RegistrationType.Patient);
    expect(output.guardianId).toBeNull();
    expect(output.patientId).toBe(first(sut.patientRepository.patients).id);
    expect(sut.guardianRepository.guardians).toHaveLength(0);

    const patient = first(sut.patientRepository.patients);
    expect(patient.guardianId).toBeUndefined();
    expect(patient.document.value).toBe("11144477735");

    const user = first(sut.userRepository.users);
    expect(user.profile).toBe(UserProfile.Patient);
    expect(user.guardianId).toBeUndefined();
    expect(user.patientId).toBe(patient.id);
    expect(user.passwordHash.value).toBe("hashed:secret123");
    expect(JSON.stringify(output)).not.toContain("secret123");
    expect(sut.hashService.hashCalls).toEqual(["secret123"]);
    expect(sut.unitOfWork.executions).toBe(1);
  });

  it("fails Patient registration when email already exists in the same organization", async () => {
    const sut = makeSut();
    await sut.useCase.execute(patientInput({}, "dup@example.com"));

    await expect(
      sut.useCase.execute(patientInput({ document: OTHER_CPF }, "  DUP@example.com  ")),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(sut.patientRepository.patients).toHaveLength(1);
    expect(sut.userRepository.users).toHaveLength(1);
  });

  it("fails Patient registration when patient document already exists in the organization", async () => {
    const sut = makeSut();
    await sut.useCase.execute(patientInput({}, "first@example.com"));

    await expect(
      sut.useCase.execute(patientInput({}, "second@example.com")),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(sut.patientRepository.patients).toHaveLength(1);
    expect(sut.userRepository.users).toHaveLength(1);
  });

  it("creates User, Guardian, and linked Patient for LegalGuardian registrations", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute(legalGuardianInput());

    const guardian = first(sut.guardianRepository.guardians);
    const patient = first(sut.patientRepository.patients);
    const user = first(sut.userRepository.users);

    expect(output).toEqual({
      userId: user.id,
      guardianId: guardian.id,
      patientId: patient.id,
      registrationType: RegistrationType.LegalGuardian,
    });
    expect(user.profile).toBe(UserProfile.Guardian);
    expect(user.guardianId).toBe(guardian.id);
    expect(user.patientId).toBeUndefined();
    expect(patient.guardianId).toBe(guardian.id);
    expect(patient.underPrivileged).toBe(true);
    expect(sut.unitOfWork.executions).toBe(1);
  });

  it("fails LegalGuardian registration when guardian document already exists", async () => {
    const sut = makeSut();
    await sut.useCase.execute(petTutorInput({}, "first-guardian@example.com"));

    await expect(
      sut.useCase.execute(
        legalGuardianInput({
          email: "second-guardian@example.com",
          patient: { document: OTHER_CPF },
        }),
      ),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(sut.guardianRepository.guardians).toHaveLength(1);
    expect(sut.patientRepository.patients).toHaveLength(0);
    expect(sut.userRepository.users).toHaveLength(1);
  });

  it("creates User and Guardian only for PetTutor registrations", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute(petTutorInput());

    const guardian = first(sut.guardianRepository.guardians);
    const user = first(sut.userRepository.users);

    expect(output).toEqual({
      userId: user.id,
      guardianId: guardian.id,
      patientId: null,
      registrationType: RegistrationType.PetTutor,
    });
    expect(user.profile).toBe(UserProfile.Guardian);
    expect(user.guardianId).toBe(guardian.id);
    expect(user.patientId).toBeUndefined();
    expect(sut.patientRepository.patients).toHaveLength(0);
    expect(sut.unitOfWork.executions).toBe(1);
  });

  it("fails PetTutor registration when guardian document already exists", async () => {
    const sut = makeSut();
    await sut.useCase.execute(petTutorInput({}, "first-tutor@example.com"));

    await expect(
      sut.useCase.execute(petTutorInput({}, "second-tutor@example.com")),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(sut.guardianRepository.guardians).toHaveLength(1);
    expect(sut.userRepository.users).toHaveLength(1);
  });
});
