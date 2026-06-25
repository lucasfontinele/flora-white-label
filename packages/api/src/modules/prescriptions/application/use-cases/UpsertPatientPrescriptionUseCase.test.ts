import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { UpsertPatientPrescriptionUseCase } from "./UpsertPatientPrescriptionUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryOrganizationRepository,
  InMemoryPatientPrescriptionRepository,
  InMemoryPatientRepository,
} from "./prescription-use-case-test-utils.js";

function makeSut() {
  const organizationRepository = new InMemoryOrganizationRepository();
  const patientRepository = new InMemoryPatientRepository();
  const prescriptionRepository = new InMemoryPatientPrescriptionRepository();
  organizationRepository.add("org-1");
  patientRepository.add("org-1", "patient-1", "João Silva");
  // The real repository resolves the patient name via the prisma include; mirror
  // that here so the read model carries it.
  prescriptionRepository.patientNames.set("patient-1", "João Silva");
  const useCase = new UpsertPatientPrescriptionUseCase({
    organizationRepository,
    patientRepository,
    prescriptionRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { organizationRepository, patientRepository, prescriptionRepository, useCase };
}

describe("UpsertPatientPrescriptionUseCase", () => {
  it("creates a prescription for a patient on first use", async () => {
    const { prescriptionRepository, useCase } = makeSut();

    const output = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      validUntil: new Date("2026-12-31T00:00:00.000Z"),
      observations: "  Receita MEMED  ",
    });

    expect(output.id).toEqual(expect.any(String));
    expect(output.patientId).toBe("patient-1");
    expect(output.patientName).toBe("João Silva");
    expect(output.validUntil).toEqual(new Date("2026-12-31T00:00:00.000Z"));
    expect(output.observations).toBe("Receita MEMED");
    expect(prescriptionRepository.prescriptions.size).toBe(1);
  });

  it("replaces the existing prescription (single active per patient)", async () => {
    const { prescriptionRepository, useCase } = makeSut();
    prescriptionRepository.seed({
      id: "presc-1",
      organizationId: "org-1",
      patientId: "patient-1",
      validUntil: new Date("2026-01-01T00:00:00.000Z"),
      observations: "antiga",
    });

    const output = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      validUntil: new Date("2027-06-30T00:00:00.000Z"),
    });

    expect(output.id).toBe("presc-1");
    expect(output.validUntil).toEqual(new Date("2027-06-30T00:00:00.000Z"));
    expect(output.observations).toBeNull();
    expect(prescriptionRepository.prescriptions.size).toBe(1);
  });

  it("fails when organization does not exist", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({
        organizationId: "missing",
        patientId: "patient-1",
        validUntil: new Date("2026-12-31T00:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("fails when the patient does not belong to the organization", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "missing",
        validUntil: new Date("2026-12-31T00:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
