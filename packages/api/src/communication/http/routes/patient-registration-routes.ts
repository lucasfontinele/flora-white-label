import type { FastifyPluginAsync } from "fastify";
import type { PasswordHasher } from "../../../application/authentication/authentication-repository.js";
import { CreatePatientRegistrationUseCase } from "../../../application/patients/create-patient-registration-use-case.js";
import type { PatientRegistrationRepository } from "../../../application/patients/patient-registration-repository.js";
import { PrismaPatientRegistrationRepository } from "../../../infrastructure/database/prisma-patient-registration-repository.js";
import { Argon2PasswordHasher } from "../../../infrastructure/security/argon2-password-hasher.js";

export type PatientRegistrationRoutesOptions = {
  passwordHasher?: PasswordHasher;
  patientRegistrationRepository?: PatientRegistrationRepository;
};

export function patientRegistrationRoutes(
  options: PatientRegistrationRoutesOptions = {},
): FastifyPluginAsync {
  return async (app) => {
    const patientRegistrationRepository =
      options.patientRegistrationRepository ?? new PrismaPatientRegistrationRepository();
    const passwordHasher = options.passwordHasher ?? new Argon2PasswordHasher();
    const createPatientRegistrationUseCase = new CreatePatientRegistrationUseCase(
      patientRegistrationRepository,
      passwordHasher,
    );

    app.post("/patient-registrations", async (request, reply) => {
      const registration = await createPatientRegistrationUseCase.execute(request.body);

      return reply.status(201).send(registration);
    });
  };
}
