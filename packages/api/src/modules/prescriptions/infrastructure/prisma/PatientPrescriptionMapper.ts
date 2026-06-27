import type {
  PatientPrescription as PrismaPatientPrescription,
  PrescriptionItem as PrismaPrescriptionItem,
  Prisma,
} from "@prisma/client";
import type { ProductCategory } from "../../../products/domain/enums/ProductCategory.js";
import type { ProductUnit } from "../../../products/domain/enums/ProductUnit.js";
import type { PatientPrescriptionReadModel } from "../../application/repositories/PatientPrescriptionRepository.js";
import { PatientPrescription } from "../../domain/entities/PatientPrescription.js";
import type { PrescriptionItem } from "../../domain/entities/PrescriptionItem.js";
import type { PrescriptionItemScope } from "../../domain/enums/PrescriptionItemScope.js";
import type { PrescriptionPeriod } from "../../domain/enums/PrescriptionPeriod.js";

type PrismaPrescriptionItemWithProduct = PrismaPrescriptionItem & {
  product: { name: string; unit: string } | null;
};

type PrismaPatientPrescriptionWithRelations = PrismaPatientPrescription & {
  patient: { name: string };
  items: PrismaPrescriptionItemWithProduct[];
};

export class PatientPrescriptionMapper {
  static toDomain(record: PrismaPatientPrescription): PatientPrescription {
    return PatientPrescription.create(
      {
        organizationId: record.organizationId,
        patientId: record.patientId,
        issuedAt: record.issuedAt,
        validUntil: record.validUntil,
        observations: record.observations,
      },
      record.id,
    );
  }

  static toReadModel(
    record: PrismaPatientPrescriptionWithRelations,
  ): PatientPrescriptionReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      patientId: record.patientId,
      patientName: record.patient.name,
      issuedAt: record.issuedAt,
      validUntil: record.validUntil,
      observations: record.observations,
      items: record.items.map((item) => ({
        id: item.id,
        scope: item.scope as PrescriptionItemScope,
        productId: item.productId,
        productName: item.product?.name ?? null,
        productUnit: (item.product?.unit ?? null) as ProductUnit | null,
        category: item.category as ProductCategory | null,
        allowedQuantity: item.allowedQuantity,
        period: item.period as PrescriptionPeriod,
        notes: item.notes,
      })),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(
    prescription: PatientPrescription,
  ): Prisma.PatientPrescriptionUncheckedCreateInput {
    return {
      id: prescription.id,
      organizationId: prescription.organizationId,
      patientId: prescription.patientId,
      issuedAt: prescription.issuedAt,
      validUntil: prescription.validUntil,
      observations: prescription.observations,
    };
  }

  static toUpdatePersistence(
    prescription: PatientPrescription,
  ): Prisma.PatientPrescriptionUncheckedUpdateInput {
    return {
      issuedAt: prescription.issuedAt,
      validUntil: prescription.validUntil,
      observations: prescription.observations,
    };
  }

  static itemToPersistence(
    item: PrescriptionItem,
  ): Prisma.PrescriptionItemUncheckedCreateInput {
    return {
      id: item.id,
      prescriptionId: item.prescriptionId,
      scope: item.scope,
      productId: item.productId,
      category: item.category,
      allowedQuantity: item.allowedQuantity,
      period: item.period,
      notes: item.notes,
    };
  }
}
