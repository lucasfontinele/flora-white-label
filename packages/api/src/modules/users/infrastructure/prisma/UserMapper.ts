import { type Prisma, type User as PrismaUser, UserProfile as PrismaUserProfile } from "@prisma/client";
import { User } from "../../domain/entities/User.js";
import { Email } from "../../domain/value-objects/Email.js";
import { PasswordHash } from "../../domain/value-objects/PasswordHash.js";
import { UserProfile } from "../../domain/enums/UserProfile.js";

const PROFILE_TO_PRISMA: Record<UserProfile, PrismaUserProfile> = {
  [UserProfile.Master]: PrismaUserProfile.Master,
  [UserProfile.Patient]: PrismaUserProfile.Patient,
  [UserProfile.Guardian]: PrismaUserProfile.Guardian,
};

const PROFILE_FROM_PRISMA: Record<PrismaUserProfile, UserProfile> = {
  [PrismaUserProfile.Master]: UserProfile.Master,
  [PrismaUserProfile.Patient]: UserProfile.Patient,
  [PrismaUserProfile.Guardian]: UserProfile.Guardian,
};

export class UserMapper {
  static toDomain(record: PrismaUser): User {
    return User.create(
      {
        organizationId: record.organizationId,
        email: Email.create(record.email),
        passwordHash: PasswordHash.fromHash(record.passwordHashed),
        profile: PROFILE_FROM_PRISMA[record.profile],
        guardianId: record.guardianId ?? undefined,
        patientId: record.patientId ?? undefined,
      },
      record.id,
    );
  }

  static toPersistence(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email.value,
      passwordHashed: user.passwordHash.value,
      profile: PROFILE_TO_PRISMA[user.profile],
      guardianId: user.guardianId ?? null,
      patientId: user.patientId ?? null,
    };
  }

  static toPersistenceUpdate(user: User): Prisma.UserUncheckedUpdateInput {
    return {
      organizationId: user.organizationId,
      email: user.email.value,
      passwordHashed: user.passwordHash.value,
      profile: PROFILE_TO_PRISMA[user.profile],
      guardianId: user.guardianId ?? null,
      patientId: user.patientId ?? null,
    };
  }
}
