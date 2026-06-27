import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { Prescriber } from "../../domain/entities/Prescriber.js";
import { DeletePrescriberUseCase } from "./DeletePrescriberUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryPrescriberRepository,
} from "./prescriber-use-case-test-utils.js";

function seedRepo() {
  const repository = new InMemoryPrescriberRepository();
  repository.seed(
    Prescriber.create(
      { organizationId: "org-1", patientId: "patient-1", fullName: "Dr. A", crm: "111", crmState: "SP" },
      "presc-1",
    ),
  );
  return repository;
}

describe("DeletePrescriberUseCase", () => {
  it("deletes a prescriber of the patient", async () => {
    const repository = seedRepo();
    const useCase = new DeletePrescriberUseCase({
      prescriberRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await useCase.execute({ organizationId: "org-1", patientId: "patient-1", prescriberId: "presc-1" });

    expect(repository.deleteCalls).toBe(1);
    expect(repository.prescribers.size).toBe(0);
  });

  it("fails when the prescriber does not exist", async () => {
    const repository = seedRepo();
    const useCase = new DeletePrescriberUseCase({
      prescriberRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({ organizationId: "org-1", patientId: "patient-1", prescriberId: "ghost" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
