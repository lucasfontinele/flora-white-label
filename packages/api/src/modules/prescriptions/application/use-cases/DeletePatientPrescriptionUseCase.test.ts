import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DeletePatientPrescriptionUseCase } from "./DeletePatientPrescriptionUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryPatientPrescriptionRepository,
} from "./prescription-use-case-test-utils.js";

describe("DeletePatientPrescriptionUseCase", () => {
  it("deletes the patient's prescription", async () => {
    const repository = new InMemoryPatientPrescriptionRepository();
    repository.seed({
      id: "presc-1",
      organizationId: "org-1",
      patientId: "patient-1",
      validUntil: new Date("2026-12-31T00:00:00.000Z"),
    });
    const useCase = new DeletePatientPrescriptionUseCase({
      prescriptionRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(repository.deleteCalls).toBe(1);
    expect(repository.prescriptions.size).toBe(0);
  });

  it("fails when there is no prescription to delete", async () => {
    const repository = new InMemoryPatientPrescriptionRepository();
    const useCase = new DeletePatientPrescriptionUseCase({
      prescriptionRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({ organizationId: "org-1", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
