import type { Prisma, Guardian as PrismaGuardian } from "@prisma/client";
import { Guardian } from "../../domain/entities/Guardian.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import {
  genderFromPrisma,
  genderToPrisma,
} from "../../../../shared/infrastructure/database/prisma/gender-mapper.js";

export class GuardianMapper {
  static toDomain(record: PrismaGuardian): Guardian {
    return Guardian.create(
      {
        organizationId: record.organizationId,
        name: record.name,
        document: Document.create(record.document),
        birthdate: record.birthdate,
        gender: genderFromPrisma(record.gender),
      },
      record.id,
    );
  }

  static toPersistence(guardian: Guardian): Prisma.GuardianUncheckedCreateInput {
    return {
      id: guardian.id,
      organizationId: guardian.organizationId,
      name: guardian.name,
      document: guardian.document.value,
      birthdate: guardian.birthdate,
      gender: genderToPrisma(guardian.gender),
    };
  }
}
