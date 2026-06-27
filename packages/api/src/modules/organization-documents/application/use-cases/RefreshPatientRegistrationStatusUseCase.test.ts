import { describe, expect, it } from "vitest";
import { Gender } from "../../../../shared/domain/enums/Gender.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import { Patient } from "../../../patients/domain/entities/Patient.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import { InMemoryPatientPrescriptionRepository } from "../../../prescriptions/application/use-cases/prescription-use-case-test-utils.js";
import { RefreshPatientRegistrationStatusUseCase } from "./RefreshPatientRegistrationStatusUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryApprovalRepository,
  InMemoryPatientRepository,
  InMemoryRequiredDocumentRepository,
} from "./organization-document-use-case-test-utils.js";

const TEST_CPF = "52998224725";

function makePatient(status: PatientStatus): Patient {
  return Patient.create(
    {
      organizationId: "org-1",
      name: "Paciente Teste",
      document: Document.create(TEST_CPF),
      birthdate: new Date("2000-01-01T00:00:00.000Z"),
      gender: Gender.Male,
      underPrivileged: false,
      patientStatus: status,
      rejectionReason: status === PatientStatus.Rejected ? "Documentos inválidos" : null,
    },
    "patient-1",
  );
}

function makeSut(status: PatientStatus) {
  const patientRepository = new InMemoryPatientRepository();
  const requiredDocumentRepository = new InMemoryRequiredDocumentRepository();
  const approvalRepository = new InMemoryApprovalRepository();
  const prescriptionRepository = new InMemoryPatientPrescriptionRepository();

  patientRepository.seed(makePatient(status));
  requiredDocumentRepository.seed({ id: "doc-1", organizationId: "org-1", name: "Receita" });

  const useCase = new RefreshPatientRegistrationStatusUseCase({
    patientRepository,
    prescriptionRepository,
    requiredDocumentRepository,
    approvalRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { patientRepository, requiredDocumentRepository, approvalRepository, prescriptionRepository, useCase };
}

function seedUploadedDocument(sut: ReturnType<typeof makeSut>) {
  sut.approvalRepository.seed({
    id: "ap-1",
    organizationId: "org-1",
    documentId: "doc-1",
    patientId: "patient-1",
    fileName: "receita.pdf",
    mimeType: "application/pdf",
    size: 1024,
    storageKey: "patients/patient-1/doc-1.pdf",
  });
}

function seedValidPrescription(sut: ReturnType<typeof makeSut>) {
  sut.prescriptionRepository.seed({
    id: "presc-1",
    organizationId: "org-1",
    patientId: "patient-1",
    validUntil: new Date("2999-01-01T00:00:00.000Z"),
  });
}

const input = { organizationId: "org-1", patientId: "patient-1" } as const;

describe("RefreshPatientRegistrationStatusUseCase", () => {
  it("keeps an approved patient with uploaded docs and a valid receita", async () => {
    const sut = makeSut(PatientStatus.Approval);
    seedUploadedDocument(sut);
    seedValidPrescription(sut);

    const result = await sut.useCase.execute(input);

    expect(result.changed).toBe(false);
    expect(result.patientStatus).toBe(PatientStatus.Approval);
  });

  it("demotes an approved patient whose receita expired", async () => {
    const sut = makeSut(PatientStatus.Approval);
    seedUploadedDocument(sut);
    sut.prescriptionRepository.seed({
      id: "presc-1",
      organizationId: "org-1",
      patientId: "patient-1",
      validUntil: new Date("2020-01-01T00:00:00.000Z"),
    });

    const result = await sut.useCase.execute(input);

    expect(result.changed).toBe(true);
    expect(result.patientStatus).toBe(PatientStatus.WaitingDocuments);
  });

  it("demotes an approved patient with no prescription at all", async () => {
    const sut = makeSut(PatientStatus.Approval);
    seedUploadedDocument(sut);

    const result = await sut.useCase.execute(input);

    expect(result.changed).toBe(true);
    expect(result.patientStatus).toBe(PatientStatus.WaitingDocuments);
  });

  it("demotes an approved patient with a required document pending submission", async () => {
    const sut = makeSut(PatientStatus.Approval);
    seedValidPrescription(sut);
    // doc-1 has no uploaded approval.

    const result = await sut.useCase.execute(input);

    expect(result.changed).toBe(true);
    expect(result.patientStatus).toBe(PatientStatus.WaitingDocuments);
  });

  it("demotes a waiting-approval patient with a pending document, ignoring the receita", async () => {
    const sut = makeSut(PatientStatus.WaitingApproval);

    const result = await sut.useCase.execute(input);

    expect(result.changed).toBe(true);
    expect(result.patientStatus).toBe(PatientStatus.WaitingDocuments);
  });

  it("keeps a waiting-approval patient whose documents are all uploaded", async () => {
    const sut = makeSut(PatientStatus.WaitingApproval);
    seedUploadedDocument(sut);

    const result = await sut.useCase.execute(input);

    expect(result.changed).toBe(false);
    expect(result.patientStatus).toBe(PatientStatus.WaitingApproval);
  });

  it("leaves rejected and already-waiting patients untouched", async () => {
    const rejected = makeSut(PatientStatus.Rejected);
    expect((await rejected.useCase.execute(input)).changed).toBe(false);

    const waiting = makeSut(PatientStatus.WaitingDocuments);
    expect((await waiting.useCase.execute(input)).changed).toBe(false);
  });
});
