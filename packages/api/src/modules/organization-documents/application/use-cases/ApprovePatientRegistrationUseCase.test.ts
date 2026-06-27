import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import { InMemoryPatientPrescriptionRepository } from "../../../prescriptions/application/use-cases/prescription-use-case-test-utils.js";
import { PrescriptionItemScope } from "../../../prescriptions/domain/enums/PrescriptionItemScope.js";
import { PrescriptionPeriod } from "../../../prescriptions/domain/enums/PrescriptionPeriod.js";
import { ProductUnit } from "../../../products/domain/enums/ProductUnit.js";
import { DocumentApprovalStatus } from "../../domain/enums/DocumentApprovalStatus.js";
import { ApprovePatientRegistrationUseCase } from "./ApprovePatientRegistrationUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryApprovalRepository,
  InMemoryPatientRepository,
  InMemoryRequiredDocumentRepository,
} from "./organization-document-use-case-test-utils.js";

type PrescriptionVariant = "valid" | "none" | "expired" | "empty-items";

function makeSut(variant: PrescriptionVariant = "valid") {
  const patientRepository = new InMemoryPatientRepository();
  const requiredDocumentRepository = new InMemoryRequiredDocumentRepository();
  const approvalRepository = new InMemoryApprovalRepository();
  const prescriptionRepository = new InMemoryPatientPrescriptionRepository();
  patientRepository.add("org-1", "patient-1");
  requiredDocumentRepository.seed({ id: "doc-1", organizationId: "org-1", name: "Receita" });

  if (variant !== "none") {
    prescriptionRepository.seed({
      id: "presc-1",
      organizationId: "org-1",
      patientId: "patient-1",
      validUntil:
        variant === "expired"
          ? new Date("2020-01-01T00:00:00.000Z")
          : new Date("2999-01-01T00:00:00.000Z"),
      items:
        variant === "empty-items"
          ? []
          : [
              {
                id: "item-1",
                scope: PrescriptionItemScope.Product,
                productId: "product-1",
                productName: "Flor CBD",
                productUnit: ProductUnit.Gram,
                category: null,
                allowedQuantity: 120,
                period: PrescriptionPeriod.Annual,
                notes: null,
              },
            ],
    });
  }

  const useCase = new ApprovePatientRegistrationUseCase({
    patientRepository,
    requiredDocumentRepository,
    approvalRepository,
    prescriptionRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { patientRepository, requiredDocumentRepository, approvalRepository, prescriptionRepository, useCase };
}

function seedApprovedDocument(sut: ReturnType<typeof makeSut>) {
  sut.approvalRepository.seed({
    id: "ap-1",
    organizationId: "org-1",
    documentId: "doc-1",
    patientId: "patient-1",
    status: DocumentApprovalStatus.Approved,
  });
}

describe("ApprovePatientRegistrationUseCase", () => {
  it("approves the registration when documents are approved and the receita is valid", async () => {
    const sut = makeSut();
    seedApprovedDocument(sut);

    const output = await sut.useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.patientStatus).toBe(PatientStatus.Approval);
    expect(output.rejectionReason).toBeNull();
  });

  it("blocks approval when a required document is still pending", async () => {
    const sut = makeSut();
    sut.approvalRepository.seed({
      id: "ap-1",
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
      status: DocumentApprovalStatus.Pending,
    });

    await expect(
      sut.useCase.execute({ organizationId: "org-1", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("blocks approval when there are no documents uploaded at all", async () => {
    const sut = makeSut();

    await expect(
      sut.useCase.execute({ organizationId: "org-1", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("blocks approval when the patient has no prescription", async () => {
    const sut = makeSut("none");
    seedApprovedDocument(sut);

    await expect(
      sut.useCase.execute({ organizationId: "org-1", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("blocks approval when the prescription is expired", async () => {
    const sut = makeSut("expired");
    seedApprovedDocument(sut);

    await expect(
      sut.useCase.execute({ organizationId: "org-1", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("blocks approval when the posology has no items", async () => {
    const sut = makeSut("empty-items");
    seedApprovedDocument(sut);

    await expect(
      sut.useCase.execute({ organizationId: "org-1", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("fails when the patient is not in the organization", async () => {
    const sut = makeSut();

    await expect(
      sut.useCase.execute({ organizationId: "org-2", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
