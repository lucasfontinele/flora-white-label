import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { Prescriber } from "../../domain/entities/Prescriber.js";
import { UpdatePrescriberUseCase } from "./UpdatePrescriberUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryPrescriberRepository,
} from "./prescriber-use-case-test-utils.js";

function makeUseCase() {
  const prescriberRepository = new InMemoryPrescriberRepository();
  prescriberRepository.seed(
    Prescriber.create(
      { organizationId: "org-1", patientId: "patient-1", fullName: "Dr. A", crm: "111", crmState: "SP" },
      "presc-1",
    ),
  );
  const useCase = new UpdatePrescriberUseCase({
    prescriberRepository,
    unitOfWork: immediateUnitOfWork,
  });
  return { useCase, prescriberRepository };
}

const base = { organizationId: "org-1", patientId: "patient-1", prescriberId: "presc-1" };

describe("UpdatePrescriberUseCase", () => {
  it("updates the prescriber details", async () => {
    const { useCase } = makeUseCase();

    const output = await useCase.execute({
      ...base,
      fullName: "Dr. Renomeado",
      crm: "222",
      crmState: "rj",
    });

    expect(output.fullName).toBe("Dr. Renomeado");
    expect(output.crm).toBe("222");
    expect(output.crmState).toBe("RJ");
  });

  it("fails when the prescriber belongs to another patient", async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({ ...base, patientId: "other", fullName: "X", crm: "1", crmState: "SP" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects an update that collides with another prescriber's CRM/UF", async () => {
    const { useCase, prescriberRepository } = makeUseCase();
    prescriberRepository.seed(
      Prescriber.create(
        { organizationId: "org-1", patientId: "patient-1", fullName: "Dr. B", crm: "999", crmState: "MG" },
        "presc-2",
      ),
    );

    await expect(
      useCase.execute({ ...base, fullName: "Dr. A", crm: "999", crmState: "mg" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
