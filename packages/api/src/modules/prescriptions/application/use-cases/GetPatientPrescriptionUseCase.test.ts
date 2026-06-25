import { describe, expect, it } from "vitest";
import { GetPatientPrescriptionUseCase } from "./GetPatientPrescriptionUseCase.js";
import { InMemoryPatientPrescriptionRepository } from "./prescription-use-case-test-utils.js";

describe("GetPatientPrescriptionUseCase", () => {
  it("returns null when the patient has no prescription", async () => {
    const repository = new InMemoryPatientPrescriptionRepository();
    const useCase = new GetPatientPrescriptionUseCase(repository);

    const output = await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.prescription).toBeNull();
  });

  it("returns the patient's prescription with the patient name", async () => {
    const repository = new InMemoryPatientPrescriptionRepository();
    repository.seed({
      id: "presc-1",
      organizationId: "org-1",
      patientId: "patient-1",
      patientName: "João Silva",
      validUntil: new Date("2026-12-31T00:00:00.000Z"),
    });
    const useCase = new GetPatientPrescriptionUseCase(repository);

    const output = await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.prescription?.id).toBe("presc-1");
    expect(output.prescription?.patientName).toBe("João Silva");
  });

  it("does not return a prescription scoped to another organization", async () => {
    const repository = new InMemoryPatientPrescriptionRepository();
    repository.seed({
      id: "presc-1",
      organizationId: "org-1",
      patientId: "patient-1",
      validUntil: new Date("2026-12-31T00:00:00.000Z"),
    });
    const useCase = new GetPatientPrescriptionUseCase(repository);

    const output = await useCase.execute({ organizationId: "org-2", patientId: "patient-1" });

    expect(output.prescription).toBeNull();
  });
});
