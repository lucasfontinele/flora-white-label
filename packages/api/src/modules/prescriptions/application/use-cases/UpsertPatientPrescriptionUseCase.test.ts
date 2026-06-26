import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { ProductUnit } from "../../../products/domain/enums/ProductUnit.js";
import { PrescriptionPeriod } from "../../domain/enums/PrescriptionPeriod.js";
import { UpsertPatientPrescriptionUseCase } from "./UpsertPatientPrescriptionUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryOrganizationRepository,
  InMemoryPatientPrescriptionRepository,
  InMemoryPatientRepository,
  InMemoryProductRepository,
} from "./prescription-use-case-test-utils.js";

function makeSut() {
  const organizationRepository = new InMemoryOrganizationRepository();
  const patientRepository = new InMemoryPatientRepository();
  const productRepository = new InMemoryProductRepository();
  const prescriptionRepository = new InMemoryPatientPrescriptionRepository();
  organizationRepository.add("org-1");
  patientRepository.add("org-1", "patient-1", "João Silva");
  productRepository.add("product-1", { name: "Flor CBD", unit: ProductUnit.Gram });
  // The real repository resolves the patient/product names via the prisma
  // include; mirror that here so the read model carries them.
  prescriptionRepository.patientNames.set("patient-1", "João Silva");
  prescriptionRepository.registerProduct("product-1", "Flor CBD", ProductUnit.Gram);
  const useCase = new UpsertPatientPrescriptionUseCase({
    organizationRepository,
    patientRepository,
    productRepository,
    prescriptionRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { organizationRepository, patientRepository, productRepository, prescriptionRepository, useCase };
}

const onePosologyItem = [
  {
    productId: "product-1",
    allowedQuantity: 120,
    period: PrescriptionPeriod.Annual,
    notes: "Vaporizar 0,2 a 0,3g",
  },
];

describe("UpsertPatientPrescriptionUseCase", () => {
  it("creates a prescription and derives validUntil as issuedAt + 6 months", async () => {
    const { prescriptionRepository, useCase } = makeSut();

    const output = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      issuedAt: new Date("2026-06-26T00:00:00.000Z"),
      observations: "  Receita MEMED  ",
      items: onePosologyItem,
    });

    expect(output.id).toEqual(expect.any(String));
    expect(output.patientId).toBe("patient-1");
    expect(output.patientName).toBe("João Silva");
    expect(output.issuedAt).toEqual(new Date("2026-06-26T00:00:00.000Z"));
    // +6 months in UTC.
    expect(output.validUntil).toEqual(new Date("2026-12-26T00:00:00.000Z"));
    expect(output.observations).toBe("Receita MEMED");
    expect(output.items).toHaveLength(1);
    expect(output.items[0]?.productId).toBe("product-1");
    expect(output.items[0]?.allowedQuantity).toBe(120);
    expect(output.items[0]?.period).toBe(PrescriptionPeriod.Annual);
    expect(prescriptionRepository.prescriptions.size).toBe(1);
  });

  it("clamps the day to the end of the target month", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      issuedAt: new Date("2026-08-31T00:00:00.000Z"),
      items: onePosologyItem,
    });

    // Aug 31 + 6 months → Feb 28 2027 (not Mar 3).
    expect(output.validUntil).toEqual(new Date("2027-02-28T00:00:00.000Z"));
  });

  it("replaces the existing prescription and its items (single active per patient)", async () => {
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
      issuedAt: new Date("2027-01-01T00:00:00.000Z"),
      items: onePosologyItem,
    });

    expect(output.id).toBe("presc-1");
    expect(output.validUntil).toEqual(new Date("2027-07-01T00:00:00.000Z"));
    expect(output.observations).toBeNull();
    expect(output.items).toHaveLength(1);
    expect(prescriptionRepository.prescriptions.size).toBe(1);
  });

  it("accepts an empty posology (items can be filled later)", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      issuedAt: new Date("2026-06-26T00:00:00.000Z"),
      items: [],
    });

    expect(output.items).toHaveLength(0);
  });

  it("rejects duplicate products in the posology", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        issuedAt: new Date("2026-06-26T00:00:00.000Z"),
        items: [
          { productId: "product-1", allowedQuantity: 10, period: PrescriptionPeriod.Monthly },
          { productId: "product-1", allowedQuantity: 20, period: PrescriptionPeriod.Annual },
        ],
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });

  it("rejects a posology product that does not exist in the organization", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        issuedAt: new Date("2026-06-26T00:00:00.000Z"),
        items: [{ productId: "missing", allowedQuantity: 10, period: PrescriptionPeriod.Monthly }],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a posology product that is inactive", async () => {
    const { productRepository, useCase } = makeSut();
    productRepository.add("product-2", { isActive: false });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        issuedAt: new Date("2026-06-26T00:00:00.000Z"),
        items: [{ productId: "product-2", allowedQuantity: 10, period: PrescriptionPeriod.Monthly }],
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("fails when organization does not exist", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({
        organizationId: "missing",
        patientId: "patient-1",
        issuedAt: new Date("2026-06-26T00:00:00.000Z"),
        items: onePosologyItem,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("fails when the patient does not belong to the organization", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "missing",
        issuedAt: new Date("2026-06-26T00:00:00.000Z"),
        items: onePosologyItem,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
