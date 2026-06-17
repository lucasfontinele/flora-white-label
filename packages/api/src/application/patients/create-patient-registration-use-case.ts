import type { CreatePatientRegistrationResponse } from "@flora/shared/patients";
import { ConflictException } from "../../exception/index.js";
import { authenticatedUserProfileToDto } from "../../domain/patients/patient.js";
import { parsePatientRegistrationInput } from "../../domain/patients/patient-registration.js";
import type { PasswordHasher } from "../authentication/authentication-repository.js";
import type { PatientRegistrationRepository } from "./patient-registration-repository.js";

export class CreatePatientRegistrationUseCase {
  constructor(
    private readonly patientRegistrationRepository: PatientRegistrationRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: unknown): Promise<CreatePatientRegistrationResponse> {
    const parsed = parsePatientRegistrationInput(input);
    const emailExists = await this.patientRegistrationRepository.existsByEmail(parsed.user.email);

    if (emailExists) {
      throw new ConflictException("Já existe um usuário cadastrado com este e-mail.");
    }

    const created = await this.patientRegistrationRepository.create({
      ...parsed,
      user: {
        email: parsed.user.email,
        organizationId: parsed.user.organizationId,
        passwordHash: await this.passwordHasher.hash(parsed.user.password),
        role: parsed.user.role,
      },
    });

    return {
      data: {
        profile: authenticatedUserProfileToDto(created.profile)!,
        user: created.user,
      },
    };
  }
}
