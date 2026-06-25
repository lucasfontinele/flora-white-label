import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import { genderFromCode } from "../../../../shared/domain/enums/Gender.js";
import type { GuardianRepository } from "../../../guardians/application/repositories/GuardianRepository.js";
import { Guardian } from "../../../guardians/domain/entities/Guardian.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import { User } from "../../../users/domain/entities/User.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import { Email } from "../../../users/domain/value-objects/Email.js";
import { PasswordHash } from "../../../users/domain/value-objects/PasswordHash.js";
import { Patient } from "../../domain/entities/Patient.js";
import { RegistrationType } from "../../domain/enums/RegistrationType.js";
import type { PatientRepository } from "../repositories/PatientRepository.js";

export type GenderCode = "M" | "F" | "O" | "N/A";

export interface PatientRegistrationUserInput {
  email: string;
  password: string;
}

export interface PatientRegistrationGuardianInput {
  name: string;
  document: string;
  birthdate: Date | string;
  gender: GenderCode;
}

export interface PatientRegistrationPatientInput {
  name: string;
  document: string;
  birthdate: Date | string;
  gender: GenderCode;
  underPrivileged: boolean;
}

export type CreatePatientRegistrationInput =
  | {
      organizationId: string;
      registrationType: RegistrationType.Patient;
      user: PatientRegistrationUserInput;
      patient: PatientRegistrationPatientInput;
    }
  | {
      organizationId: string;
      registrationType: RegistrationType.LegalGuardian;
      user: PatientRegistrationUserInput;
      guardian: PatientRegistrationGuardianInput;
      patient: PatientRegistrationPatientInput;
    }
  | {
      organizationId: string;
      registrationType: RegistrationType.PetTutor;
      user: PatientRegistrationUserInput;
      guardian: PatientRegistrationGuardianInput;
    };

export interface CreatePatientRegistrationOutput {
  userId: string;
  guardianId: string | null;
  patientId: string | null;
  registrationType: RegistrationType;
}

export interface CreatePatientRegistrationDependencies {
  organizationRepository: OrganizationRepository;
  userRepository: UserRepository;
  guardianRepository: GuardianRepository;
  patientRepository: PatientRepository;
  hashService: HashService;
  unitOfWork: UnitOfWork;
}

export class CreatePatientRegistrationUseCase {
  constructor(private readonly deps: CreatePatientRegistrationDependencies) {}

  async execute(input: CreatePatientRegistrationInput): Promise<CreatePatientRegistrationOutput> {
    const organizationId = input.organizationId.trim();

    const organization = await this.deps.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found.");
    }

    const email = Email.create(input.user.email);
    if (await this.deps.userRepository.findByEmailInOrganization(organizationId, email)) {
      throw new ConflictError("A user with this email already exists in the organization.");
    }

    switch (input.registrationType) {
      case RegistrationType.Patient:
        return this.createPatientRegistration(organizationId, email, input);
      case RegistrationType.LegalGuardian:
        return this.createLegalGuardianRegistration(organizationId, email, input);
      case RegistrationType.PetTutor:
        return this.createPetTutorRegistration(organizationId, email, input);
    }
  }

  private async createPatientRegistration(
    organizationId: string,
    email: Email,
    input: Extract<CreatePatientRegistrationInput, { registrationType: RegistrationType.Patient }>,
  ): Promise<CreatePatientRegistrationOutput> {
    const patientDocument = await this.ensureUniquePatientDocument(organizationId, input.patient.document);
    const patient = this.makePatient(organizationId, input.patient, patientDocument);
    const user = await this.makeUser({
      organizationId,
      email,
      password: input.user.password,
      profile: UserProfile.Patient,
      patientId: patient.id,
    });

    await this.deps.unitOfWork.execute(async () => {
      await this.deps.patientRepository.create(patient);
      await this.deps.userRepository.create(user);
    });

    return {
      userId: user.id,
      guardianId: null,
      patientId: patient.id,
      registrationType: RegistrationType.Patient,
    };
  }

  private async createLegalGuardianRegistration(
    organizationId: string,
    email: Email,
    input: Extract<
      CreatePatientRegistrationInput,
      { registrationType: RegistrationType.LegalGuardian }
    >,
  ): Promise<CreatePatientRegistrationOutput> {
    const guardianDocument = await this.ensureUniqueGuardianDocument(
      organizationId,
      input.guardian.document,
    );
    const patientDocument = await this.ensureUniquePatientDocument(organizationId, input.patient.document);
    const guardian = this.makeGuardian(organizationId, input.guardian, guardianDocument);
    const patient = this.makePatient(organizationId, input.patient, patientDocument, guardian.id);
    const user = await this.makeUser({
      organizationId,
      email,
      password: input.user.password,
      profile: UserProfile.Guardian,
      guardianId: guardian.id,
    });

    await this.deps.unitOfWork.execute(async () => {
      await this.deps.guardianRepository.create(guardian);
      await this.deps.patientRepository.create(patient);
      await this.deps.userRepository.create(user);
    });

    return {
      userId: user.id,
      guardianId: guardian.id,
      patientId: patient.id,
      registrationType: RegistrationType.LegalGuardian,
    };
  }

  private async createPetTutorRegistration(
    organizationId: string,
    email: Email,
    input: Extract<CreatePatientRegistrationInput, { registrationType: RegistrationType.PetTutor }>,
  ): Promise<CreatePatientRegistrationOutput> {
    const guardianDocument = await this.ensureUniqueGuardianDocument(
      organizationId,
      input.guardian.document,
    );
    const guardian = this.makeGuardian(organizationId, input.guardian, guardianDocument);
    const user = await this.makeUser({
      organizationId,
      email,
      password: input.user.password,
      profile: UserProfile.Guardian,
      guardianId: guardian.id,
    });

    await this.deps.unitOfWork.execute(async () => {
      await this.deps.guardianRepository.create(guardian);
      await this.deps.userRepository.create(user);
    });

    return {
      userId: user.id,
      guardianId: guardian.id,
      patientId: null,
      registrationType: RegistrationType.PetTutor,
    };
  }

  private async ensureUniquePatientDocument(
    organizationId: string,
    documentValue: string,
  ): Promise<Document> {
    const document = Document.create(documentValue);
    if (await this.deps.patientRepository.findByDocument(organizationId, document)) {
      throw new ConflictError("A patient with this document already exists in the organization.");
    }

    return document;
  }

  private async ensureUniqueGuardianDocument(
    organizationId: string,
    documentValue: string,
  ): Promise<Document> {
    const document = Document.create(documentValue);
    if (await this.deps.guardianRepository.findByDocument(organizationId, document)) {
      throw new ConflictError("A guardian with this document already exists in the organization.");
    }

    return document;
  }

  private makePatient(
    organizationId: string,
    input: PatientRegistrationPatientInput,
    document: Document,
    guardianId?: string,
  ): Patient {
    return Patient.create({
      organizationId,
      guardianId,
      name: input.name,
      document,
      birthdate: this.toDate(input.birthdate),
      gender: genderFromCode(input.gender),
      underPrivileged: input.underPrivileged,
    });
  }

  private makeGuardian(
    organizationId: string,
    input: PatientRegistrationGuardianInput,
    document: Document,
  ): Guardian {
    return Guardian.create({
      organizationId,
      name: input.name,
      document,
      birthdate: this.toDate(input.birthdate),
      gender: genderFromCode(input.gender),
    });
  }

  private async makeUser(input: {
    organizationId: string;
    email: Email;
    password: string;
    profile: UserProfile;
    guardianId?: string;
    patientId?: string;
  }): Promise<User> {
    const passwordHashed = await this.deps.hashService.hash(input.password);

    return User.create({
      organizationId: input.organizationId,
      email: input.email,
      passwordHash: PasswordHash.fromHash(passwordHashed),
      profile: input.profile,
      guardianId: input.guardianId,
      patientId: input.patientId,
    });
  }

  private toDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value);
  }
}
