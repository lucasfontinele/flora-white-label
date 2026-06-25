import { describe, expect, it } from "vitest";
import { ListPatientPrescriptionsUseCase } from "./ListPatientPrescriptionsUseCase.js";
import { InMemoryPatientPrescriptionRepository } from "./prescription-use-case-test-utils.js";

describe("ListPatientPrescriptionsUseCase", () => {
  it("lists only prescriptions of the given organization", async () => {
    const repository = new InMemoryPatientPrescriptionRepository();
    repository.seed({
      id: "p1",
      organizationId: "org-1",
      patientId: "pat-1",
      validUntil: new Date("2026-12-31T00:00:00.000Z"),
    });
    repository.seed({
      id: "p2",
      organizationId: "org-1",
      patientId: "pat-2",
      validUntil: new Date("2026-11-30T00:00:00.000Z"),
    });
    repository.seed({
      id: "p3",
      organizationId: "org-2",
      patientId: "pat-3",
      validUntil: new Date("2026-10-31T00:00:00.000Z"),
    });
    const useCase = new ListPatientPrescriptionsUseCase(repository);

    const output = await useCase.execute({ organizationId: "org-1" });

    expect(output.data).toHaveLength(2);
    expect(output.data.map((prescription) => prescription.id).sort()).toEqual(["p1", "p2"]);
  });

  it("returns an empty list when the organization has no prescriptions", async () => {
    const repository = new InMemoryPatientPrescriptionRepository();
    const useCase = new ListPatientPrescriptionsUseCase(repository);

    const output = await useCase.execute({ organizationId: "org-1" });

    expect(output.data).toEqual([]);
  });
});
