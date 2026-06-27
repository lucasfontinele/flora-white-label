import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { CreatePrescriberUseCase } from "./CreatePrescriberUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryPatientRepository,
  InMemoryPrescriberRepository,
} from "./prescriber-use-case-test-utils.js";

function makeUseCase() {
  const patientRepository = new InMemoryPatientRepository();
  const prescriberRepository = new InMemoryPrescriberRepository();
  patientRepository.add("org-1", "patient-1");
  const useCase = new CreatePrescriberUseCase({
    patientRepository,
    prescriberRepository,
    unitOfWork: immediateUnitOfWork,
  });
  return { useCase, prescriberRepository };
}

const validInput = {
  organizationId: "org-1",
  patientId: "patient-1",
  fullName: "Dra. Helena Costa",
  crm: "123456",
  crmState: "sp",
};

describe("CreatePrescriberUseCase", () => {
  it("creates a prescriber for an existing patient", async () => {
    const { useCase, prescriberRepository } = makeUseCase();

    const output = await useCase.execute(validInput);

    expect(output.id).toBeTruthy();
    expect(output.crmState).toBe("SP");
    expect(prescriberRepository.prescribers.size).toBe(1);
  });

  it("fails when the patient does not exist", async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({ ...validInput, patientId: "ghost" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a duplicate CRM/UF for the same patient", async () => {
    const { useCase } = makeUseCase();
    await useCase.execute(validInput);

    await expect(
      useCase.execute({ ...validInput, fullName: "Outro nome", crmState: "SP" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects an invalid UF", async () => {
    const { useCase } = makeUseCase();

    await expect(useCase.execute({ ...validInput, crmState: "XX" })).rejects.toThrow();
  });
});
