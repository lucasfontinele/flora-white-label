import { z } from "zod";
import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Gender, genderFromCode } from "../../../../shared/domain/enums/Gender.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import type { GuardianRepository } from "../../../guardians/application/repositories/GuardianRepository.js";
import type { PatientRepository } from "../repositories/PatientRepository.js";
import type { PatientAssessmentRepository } from "../repositories/PatientAssessmentRepository.js";
import { User } from "../../../users/domain/entities/User.js";
import { Email } from "../../../users/domain/value-objects/Email.js";
import { PasswordHash } from "../../../users/domain/value-objects/PasswordHash.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import { Guardian } from "../../../guardians/domain/entities/Guardian.js";
import { Patient } from "../../domain/entities/Patient.js";
import { PatientAssessment } from "../../domain/entities/PatientAssessment.js";

const genderCodeSchema = z.enum(["M", "F", "O", "N/A"]);

const personSchema = z.object({
  name: z.string().min(1),
  document: z.string().min(1),
  birthdate: z.coerce.date(),
  gender: genderCodeSchema,
});

const inputSchema = z.object({
  organizationId: z.string().min(1),
  user: z.object({
    email: z.string().min(1),
    password: z.string().min(1),
    profile: z.enum(["Patient", "Guardian"]),
  }),
  // Optional: when the patient is self-responsible the guardian is derived from
  // the patient's own data, so a guardian block is not required.
  guardian: personSchema.optional(),
  patient: personSchema.extend({
    underPrivileged: z.boolean(),
    isSelfResponsible: z.boolean(),
  }),
});

export interface CreatePatientRegistrationInput {
  organizationId: string;
  user: {
    email: string;
    password: string;
    profile: "Patient" | "Guardian";
  };
  guardian?: {
    name: string;
    document: string;
    birthdate: Date | string;
    gender: "M" | "F" | "O" | "N/A";
  };
  patient: {
    name: string;
    document: string;
    birthdate: Date | string;
    gender: "M" | "F" | "O" | "N/A";
    underPrivileged: boolean;
    isSelfResponsible: boolean;
  };
}

export interface CreatePatientRegistrationOutput {
  userId: string;
  guardianId: string;
  patientId: string;
  patientAssessmentId?: string;
}

export interface CreatePatientRegistrationDependencies {
  userRepository: UserRepository;
  guardianRepository: GuardianRepository;
  patientRepository: PatientRepository;
  patientAssessmentRepository: PatientAssessmentRepository;
  hashService: HashService;
  unitOfWork: UnitOfWork;
}

/**
 * Registers a patient together with the responsible guardian and the systemic
 * user, preserving consistency across User, Guardian, Patient and (when the
 * patient is under-privileged) PatientAssessment within a single transaction.
 */
export class CreatePatientRegistrationUseCase {
  constructor(private readonly deps: CreatePatientRegistrationDependencies) {}

  async execute(input: CreatePatientRegistrationInput): Promise<CreatePatientRegistrationOutput> {
    const data = inputSchema.parse(input);

    const email = Email.create(data.user.email);
    if (await this.deps.userRepository.findByEmail(email)) {
      throw new ConflictError(`A user with email "${email.value}" already exists.`);
    }

    const patientDocument = Document.create(data.patient.document);
    if (await this.deps.patientRepository.findByDocument(data.organizationId, patientDocument)) {
      throw new ConflictError("A patient with this document already exists in the organization.");
    }

    const patientGender = genderFromCode(data.patient.gender);
    const guardianData = this.resolveGuardianData(data, patientDocument, patientGender);

    // Reuse an existing guardian (same document within the organization) when
    // present; otherwise a new guardian will be created in the transaction.
    const existingGuardian = await this.deps.guardianRepository.findByDocument(
      data.organizationId,
      guardianData.document,
    );

    const guardian =
      existingGuardian ??
      Guardian.create({
        organizationId: data.organizationId,
        name: guardianData.name,
        document: guardianData.document,
        birthdate: guardianData.birthdate,
        gender: guardianData.gender,
      });

    const patient = Patient.create({
      organizationId: data.organizationId,
      guardianId: guardian.id,
      name: data.patient.name,
      document: patientDocument,
      birthdate: data.patient.birthdate,
      gender: patientGender,
      underPrivileged: data.patient.underPrivileged,
    });

    const userProfile = data.patient.isSelfResponsible ? UserProfile.Patient : UserProfile.Guardian;
    const passwordHashed = await this.deps.hashService.hash(data.user.password);
    const user = User.create({
      organizationId: data.organizationId,
      email,
      passwordHash: PasswordHash.fromHash(passwordHashed),
      profile: userProfile,
      guardianId: guardian.id,
      patientId: userProfile === UserProfile.Patient ? patient.id : undefined,
    });

    const assessment = data.patient.underPrivileged
      ? PatientAssessment.createPending({ patientId: patient.id, guardianId: guardian.id })
      : undefined;

    await this.deps.unitOfWork.execute(async () => {
      if (!existingGuardian) {
        await this.deps.guardianRepository.create(guardian);
      }
      await this.deps.patientRepository.create(patient);
      await this.deps.userRepository.create(user);
      if (assessment) {
        await this.deps.patientAssessmentRepository.create(assessment);
      }
    });

    return {
      userId: user.id,
      guardianId: guardian.id,
      patientId: patient.id,
      patientAssessmentId: assessment?.id,
    };
  }

  private resolveGuardianData(
    data: z.infer<typeof inputSchema>,
    patientDocument: Document,
    patientGender: Gender,
  ): { name: string; document: Document; birthdate: Date; gender: Gender } {
    if (data.patient.isSelfResponsible) {
      return {
        name: data.patient.name,
        document: patientDocument,
        birthdate: data.patient.birthdate,
        gender: patientGender,
      };
    }

    if (!data.guardian) {
      throw new DomainValidationError(
        "A guardian is required when the patient is not self-responsible.",
      );
    }

    return {
      name: data.guardian.name,
      document: Document.create(data.guardian.document),
      birthdate: data.guardian.birthdate,
      gender: genderFromCode(data.guardian.gender),
    };
  }
}
