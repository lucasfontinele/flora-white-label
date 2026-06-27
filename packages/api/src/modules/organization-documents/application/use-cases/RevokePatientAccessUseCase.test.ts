import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { Gender } from "../../../../shared/domain/enums/Gender.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import { Patient } from "../../../patients/domain/entities/Patient.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import { RevokePatientAccessUseCase } from "./RevokePatientAccessUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryPatientRepository,
} from "./organization-document-use-case-test-utils.js";

function makeSut(status = PatientStatus.Approval) {
  const patientRepository = new InMemoryPatientRepository();
  patientRepository.seed(
    Patient.create(
      {
        organizationId: "org-1",
        name: "Paciente Teste",
        document: Document.create("52998224725"),
        birthdate: new Date("2000-01-01T00:00:00.000Z"),
        gender: Gender.Male,
        underPrivileged: false,
        patientStatus: status,
      },
      "patient-1",
    ),
  );
  const useCase = new RevokePatientAccessUseCase({
    patientRepository,
    unitOfWork: immediateUnitOfWork,
  });
  return { patientRepository, useCase };
}

describe("RevokePatientAccessUseCase", () => {
  it("sends an approved patient back to WAITING_DOCUMENTS", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.patientStatus).toBe(PatientStatus.WaitingDocuments);
  });

  it("fails for a patient outside the organization", async () => {
    const sut = makeSut();

    await expect(
      sut.useCase.execute({ organizationId: "org-2", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
