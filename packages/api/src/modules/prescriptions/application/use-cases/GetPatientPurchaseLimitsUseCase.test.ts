import { describe, expect, it } from "vitest";
import { ProductUnit } from "../../../products/domain/enums/ProductUnit.js";
import { PrescriptionPeriod } from "../../domain/enums/PrescriptionPeriod.js";
import type { OrderConsumptionRepository } from "../repositories/OrderConsumptionRepository.js";
import { GetPatientPurchaseLimitsUseCase } from "./GetPatientPurchaseLimitsUseCase.js";
import { InMemoryPatientPrescriptionRepository } from "./prescription-use-case-test-utils.js";

class FakeOrderConsumptionRepository implements OrderConsumptionRepository {
  readonly consumption = new Map<string, number>();

  set(productId: string, value: number): void {
    this.consumption.set(productId, value);
  }

  async sumProductQuantityInRange(
    _organizationId: string,
    _patientId: string,
    productId: string,
  ): Promise<number> {
    return this.consumption.get(productId) ?? 0;
  }
}

function makeSut() {
  const prescriptionRepository = new InMemoryPatientPrescriptionRepository();
  const orderConsumptionRepository = new FakeOrderConsumptionRepository();
  const useCase = new GetPatientPurchaseLimitsUseCase({
    prescriptionRepository,
    orderConsumptionRepository,
  });

  return { prescriptionRepository, orderConsumptionRepository, useCase };
}

describe("GetPatientPurchaseLimitsUseCase", () => {
  it("returns an empty result when the patient has no prescription", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.hasPrescription).toBe(false);
    expect(output.items).toHaveLength(0);
    expect(output.validUntil).toBeNull();
  });

  it("computes used and remaining per posology item", async () => {
    const { prescriptionRepository, orderConsumptionRepository, useCase } = makeSut();
    prescriptionRepository.seed({
      id: "presc-1",
      organizationId: "org-1",
      patientId: "patient-1",
      validUntil: new Date("2999-01-01T00:00:00.000Z"),
      items: [
        {
          id: "item-1",
          productId: "flor-1",
          productName: "Flor CBD",
          productUnit: ProductUnit.Gram,
          allowedQuantity: 120,
          period: PrescriptionPeriod.Annual,
          notes: "Vaporizar",
        },
      ],
    });
    orderConsumptionRepository.set("flor-1", 35);

    const output = await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.hasPrescription).toBe(true);
    expect(output.isExpired).toBe(false);
    expect(output.items).toHaveLength(1);
    expect(output.items[0]).toMatchObject({
      productId: "flor-1",
      productName: "Flor CBD",
      unit: ProductUnit.Gram,
      allowedQuantity: 120,
      used: 35,
      remaining: 85,
    });
  });

  it("never returns a negative remaining and flags expired prescriptions", async () => {
    const { prescriptionRepository, orderConsumptionRepository, useCase } = makeSut();
    prescriptionRepository.seed({
      id: "presc-1",
      organizationId: "org-1",
      patientId: "patient-1",
      validUntil: new Date("2020-01-01T00:00:00.000Z"),
      items: [
        {
          id: "item-1",
          productId: "oleo-1",
          productName: "Óleo",
          productUnit: ProductUnit.Milliliter,
          allowedQuantity: 2,
          period: PrescriptionPeriod.Monthly,
          notes: null,
        },
      ],
    });
    orderConsumptionRepository.set("oleo-1", 5);

    const output = await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.isExpired).toBe(true);
    expect(output.items[0]?.remaining).toBe(0);
  });
});
