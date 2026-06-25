import { Gender as PrismaGender } from "@prisma/client";
import { Gender } from "../../../domain/enums/Gender.js";

/**
 * Translates between the domain {@link Gender} enum and Prisma's generated
 * enum. The domain "N/A" maps to Prisma's `NA` member (DB value "N/A").
 */
const GENDER_TO_PRISMA: Record<Gender, PrismaGender> = {
  [Gender.Male]: PrismaGender.M,
  [Gender.Female]: PrismaGender.F,
  [Gender.Other]: PrismaGender.O,
  [Gender.NotInformed]: PrismaGender.NA,
};

const GENDER_FROM_PRISMA: Record<PrismaGender, Gender> = {
  [PrismaGender.M]: Gender.Male,
  [PrismaGender.F]: Gender.Female,
  [PrismaGender.O]: Gender.Other,
  [PrismaGender.NA]: Gender.NotInformed,
};

export function genderToPrisma(gender: Gender): PrismaGender {
  return GENDER_TO_PRISMA[gender];
}

export function genderFromPrisma(gender: PrismaGender): Gender {
  return GENDER_FROM_PRISMA[gender];
}
