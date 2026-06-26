import { UserProfile as PrismaUserProfile } from "@prisma/client";
import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { UserProfile } from "../../domain/enums/UserProfile.js";
import type {
  AuthenticatedUserContext,
  AuthenticatedUserContextPatient,
  AuthenticatedUserContextRepository,
} from "../../application/repositories/AuthenticatedUserContextRepository.js";

const PROFILE_FROM_PRISMA: Record<PrismaUserProfile, UserProfile> = {
  [PrismaUserProfile.Master]: UserProfile.Master,
  [PrismaUserProfile.Organization]: UserProfile.Organization,
  [PrismaUserProfile.Patient]: UserProfile.Patient,
  [PrismaUserProfile.Guardian]: UserProfile.Guardian,
};

export class PrismaAuthenticatedUserContextRepository
  implements AuthenticatedUserContextRepository
{
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByUserId(userId: string): Promise<AuthenticatedUserContext | null> {
    const record = await this.prisma.getClient().user.findUnique({
      where: { id: userId },
      include: {
        guardian: {
          include: {
            patients: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        patient: true,
        organizationEmployee: true,
      },
    });

    if (!record) {
      return null;
    }

    const organization = await this.prisma.getClient().organization.findUnique({
      where: { id: record.organizationId },
      include: {
        settings: true,
      },
    });

    return {
      user: {
        id: record.id,
        email: record.email,
        profile: PROFILE_FROM_PRISMA[record.profile],
        organizationId: record.organizationId,
        guardianId: record.guardianId ?? undefined,
        patientId: record.patientId ?? undefined,
        organizationEmployeeId: record.organizationEmployeeId ?? undefined,
      },
      organization: organization
        ? {
            id: organization.id,
            tradeName: organization.tradeName,
            legalName: organization.legalName,
            slug: organization.slug,
            logoUrl: organization.settings?.logoUrl ?? null,
            primaryColor: organization.settings?.primaryColor ?? null,
            secondaryColor: organization.settings?.secondaryColor ?? null,
          }
        : undefined,
      guardian: record.guardian
        ? {
            id: record.guardian.id,
            name: record.guardian.name,
            document: record.guardian.document,
          }
        : undefined,
      patient: record.patient ? this.toContextPatient(record.patient) : undefined,
      employee: record.organizationEmployee
        ? {
            id: record.organizationEmployee.id,
            organizationId: record.organizationEmployee.organizationId,
            fullName: record.organizationEmployee.fullName,
            document: record.organizationEmployee.document,
            isActive: record.organizationEmployee.isActive,
          }
        : undefined,
      managedPatients: record.guardian?.patients.map((patient) => this.toContextPatient(patient)) ?? [],
    };
  }

  private toContextPatient(patient: {
    id: string;
    name: string;
    document: string;
    underPrivileged: boolean;
    patientStatus: AuthenticatedUserContextPatient["patientStatus"];
  }): AuthenticatedUserContextPatient {
    return {
      id: patient.id,
      name: patient.name,
      document: patient.document,
      underPrivileged: patient.underPrivileged,
      patientStatus: patient.patientStatus,
    };
  }
}
