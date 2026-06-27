import { describe, expect, it } from "vitest";
import { Prescriber } from "../../domain/entities/Prescriber.js";
import { ListPrescribersByPatientUseCase } from "./ListPrescribersByPatientUseCase.js";
import { InMemoryPrescriberRepository } from "./prescriber-use-case-test-utils.js";

describe("ListPrescribersByPatientUseCase", () => {
  it("returns only the prescribers of the requested patient", async () => {
    const repository = new InMemoryPrescriberRepository();
    repository.seed(
      Prescriber.create(
        { organizationId: "org-1", patientId: "patient-1", fullName: "Dr. A", crm: "1", crmState: "SP" },
        "presc-1",
      ),
    );
    repository.seed(
      Prescriber.create(
        { organizationId: "org-1", patientId: "patient-2", fullName: "Dr. B", crm: "2", crmState: "RJ" },
        "presc-2",
      ),
    );
    const useCase = new ListPrescribersByPatientUseCase(repository);

    const output = await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.data).toHaveLength(1);
    expect(output.data[0]?.id).toBe("presc-1");
  });

  it("returns an empty list when the patient has no prescribers", async () => {
    const repository = new InMemoryPrescriberRepository();
    const useCase = new ListPrescribersByPatientUseCase(repository);

    const output = await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.data).toEqual([]);
  });
});
