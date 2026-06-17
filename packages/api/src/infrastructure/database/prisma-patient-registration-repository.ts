import type { PrismaClient } from "@prisma/client";
import { ConflictException } from "../../exception/index.js";
import type {
  CreatePatientRegistrationRecordInput,
  CreatedPatientRegistration,
  PatientRegistrationRepository,
} from "../../application/patients/patient-registration-repository.js";
import { prisma as defaultPrisma } from "./prisma-client.js";
import { mapAuthenticatedUserProfile } from "./prisma-patient-profile-mappers.js";

export class PrismaPatientRegistrationRepository implements PatientRegistrationRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.client.user.findUnique({
      select: { id: true },
      where: { email },
    });

    return Boolean(user);
  }

  async create(input: CreatePatientRegistrationRecordInput): Promise<CreatedPatientRegistration> {
    try {
      return await this.client.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: input.user.email,
            organizationId: input.user.organizationId,
            passwordHash: input.user.passwordHash,
            role: input.user.role,
            type: "STANDARD",
          },
        });

        const patientAddress = input.patient.address
          ? await tx.address.create({ data: input.patient.address })
          : null;

        const patient = await tx.patient.create({
          data: {
            addressId: patientAddress?.id,
            birthDate: input.patient.birthDate,
            document: input.patient.document,
            fullName: input.patient.fullName,
            gender: input.patient.gender,
            nickname: input.patient.nickname,
            organizationId: input.patient.organizationId,
            phone: input.patient.phone,
            type: input.patient.type,
            userId: input.user.role === "PATIENT" ? user.id : undefined,
          },
        });

        if (input.pet) {
          await tx.pet.create({
            data: {
              birthDate: input.pet.birthDate,
              breed: input.pet.breed,
              diagnosis: input.pet.diagnosis,
              name: input.pet.name,
              patientId: patient.id,
              species: input.pet.species,
            },
          });
        }

        if (input.guardian) {
          const guardianAddress = await tx.address.create({ data: input.guardian.address });

          await tx.patientGuardian.create({
            data: {
              addressId: guardianAddress.id,
              birthDate: input.guardian.birthDate,
              document: input.guardian.document,
              fullName: input.guardian.fullName,
              patientId: patient.id,
              phone: input.guardian.phone,
              relationship: input.guardian.relationship,
              rg: input.guardian.rg,
              userId: user.id,
            },
          });
        }

        const profile = await tx.user.findUniqueOrThrow({
          include: {
            patient: {
              include: {
                address: true,
                pet: true,
              },
            },
            patientGuardians: {
              include: {
                address: true,
                patient: {
                  include: {
                    address: true,
                    pet: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          where: { id: user.id },
        });

        return {
          profile: mapAuthenticatedUserProfile(profile)!,
          user: {
            email: user.email,
            id: user.id,
            role: input.user.role,
          },
        };
      });
    } catch (error) {
      if (isUniqueConstraintError(error, "email")) {
        throw new ConflictException("Já existe um usuário cadastrado com este e-mail.");
      }

      throw error;
    }
  }
}

function isUniqueConstraintError(error: unknown, field: string) {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: string; meta?: { target?: unknown } };
  return candidate.code === "P2002" && Array.isArray(candidate.meta?.target)
    ? candidate.meta.target.includes(field)
    : false;
}
