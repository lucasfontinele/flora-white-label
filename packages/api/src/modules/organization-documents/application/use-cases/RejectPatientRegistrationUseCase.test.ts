import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import { RejectPatientRegistrationUseCase } from "./RejectPatientRegistrationUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryPatientRepository,
} from "./organization-document-use-case-test-utils.js";

function makeSut() {
  const patientRepository = new InMemoryPatientRepository();
  patientRepository.add("org-1", "patient-1");
  const useCase = new RejectPatientRegistrationUseCase({
    patientRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { patientRepository, useCase };
}

describe("RejectPatientRegistrationUseCase", () => {
  it("rejects the registration with a trimmed reason", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      reason: "  Comprovante ilegível.  ",
    });

    expect(output.patientStatus).toBe(PatientStatus.Rejected);
    expect(output.rejectionReason).toBe("Comprovante ilegível.");
  });

  it("rejects a blank reason", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ organizationId: "org-1", patientId: "patient-1", reason: "   " }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });

  it("fails when the patient is not in the organization", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ organizationId: "org-2", patientId: "patient-1", reason: "x" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
