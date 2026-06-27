import type { Prescriber as PrismaPrescriber, Prisma } from "@prisma/client";
import type { PrescriberReadModel } from "../../application/repositories/PrescriberRepository.js";
import { Prescriber } from "../../domain/entities/Prescriber.js";

export class PrescriberMapper {
  static toDomain(record: PrismaPrescriber): Prescriber {
    return Prescriber.create(
      {
        organizationId: record.organizationId,
        patientId: record.patientId,
        fullName: record.fullName,
        crm: record.crm,
        crmState: record.crmState,
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaPrescriber): PrescriberReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      patientId: record.patientId,
      fullName: record.fullName,
      crm: record.crm,
      crmState: record.crmState,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(prescriber: Prescriber): Prisma.PrescriberUncheckedCreateInput {
    return {
      id: prescriber.id,
      organizationId: prescriber.organizationId,
      patientId: prescriber.patientId,
      fullName: prescriber.fullName,
      crm: prescriber.crm,
      crmState: prescriber.crmState,
    };
  }

  static toUpdatePersistence(prescriber: Prescriber): Prisma.PrescriberUncheckedUpdateInput {
    return {
      fullName: prescriber.fullName,
      crm: prescriber.crm,
      crmState: prescriber.crmState,
    };
  }
}
