import { type Prisma, UserProfile as PrismaUserProfile } from "@prisma/client";
import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  AssociateFilters,
  AssociateReadModel,
  OrganizationAssociateRepository,
} from "../../application/repositories/OrganizationAssociateRepository.js";

/**
 * Reads "associates" — users that represent the association's members, i.e.
 * self-responsible patients (Patient profile) and guardians/responsáveis
 * (Guardian profile). Master/Organization staff are never associates.
 */
export class PrismaOrganizationAssociateRepository implements OrganizationAssociateRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findAssociates(
    organizationId: string,
    filters: AssociateFilters,
  ): Promise<AssociateReadModel[]> {
    const profileFilter: Prisma.UserWhereInput["profile"] = filters.type
      ? filters.type === "GUARDIAN"
        ? PrismaUserProfile.Guardian
        : PrismaUserProfile.Patient
      : { in: [PrismaUserProfile.Patient, PrismaUserProfile.Guardian] };

    const search = filters.search?.trim();
    const where: Prisma.UserWhereInput = {
      organizationId,
      profile: profileFilter,
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(search
        ? {
            OR: [
              { guardian: { name: { contains: search, mode: "insensitive" } } },
              { patient: { name: { contains: search, mode: "insensitive" } } },
              {
                guardian: {
                  patients: { some: { name: { contains: search, mode: "insensitive" } } },
                },
              },
            ],
          }
        : {}),
    };

    const records = await this.prisma.getClient().user.findMany({
      where,
      include: {
        guardian: {
          include: { patients: { select: { name: true }, orderBy: { createdAt: "asc" } } },
        },
        patient: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => {
      const isGuardian = record.profile === PrismaUserProfile.Guardian;
      const name = isGuardian ? (record.guardian?.name ?? "—") : (record.patient?.name ?? "—");
      const patientNames = isGuardian
        ? (record.guardian?.patients.map((patient) => patient.name) ?? [])
        : record.patient
          ? [record.patient.name]
          : [];

      return {
        userId: record.id,
        email: record.email,
        type: isGuardian ? "GUARDIAN" : "PATIENT",
        name,
        patientNames,
        isActive: record.isActive,
        createdAt: record.createdAt,
      };
    });
  }
}
