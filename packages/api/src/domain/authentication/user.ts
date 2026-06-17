import type { AuthenticatedUserDto, UserType } from "@flora/shared/authentication";
import type { UserRole } from "@flora/shared/patients";
import { ValidationException } from "../../exception/index.js";
import {
  authenticatedUserProfileToDto,
  type AuthenticatedUserProfile,
} from "../patients/patient.js";
import { isValidEmail, normalizeText } from "../shared/validation.js";

export type AuthenticationUser = {
  email: string;
  id: string;
  isActive: boolean;
  organizationId: string | null;
  organizationIsActive: boolean | null;
  passwordHash: string;
  profile?: AuthenticatedUserProfile | null;
  role?: UserRole | null;
  type: UserType;
};

export function normalizeEmail(value: string) {
  return normalizeText(value).toLowerCase();
}

export function createAuthenticationUser(input: AuthenticationUser): AuthenticationUser {
  const email = normalizeEmail(input.email);
  const issues: string[] = [];

  if (!isValidEmail(email)) issues.push("E-mail inválido.");
  if (!input.passwordHash) issues.push("Senha protegida obrigatória.");
  if (!["MASTER", "ORGANIZATION", "STANDARD"].includes(input.type)) {
    issues.push("Tipo de usuário inválido.");
  }
  if (input.role && !["TUTOR", "PATIENT"].includes(input.role)) {
    issues.push("Papel de usuário inválido.");
  }
  if (input.type === "MASTER" && input.organizationId) {
    issues.push("Usuário master não deve possuir organização.");
  }

  if (issues.length > 0) {
    throw new ValidationException("Usuário de autenticação inválido.", issues);
  }

  return {
    ...input,
    email,
    organizationId: input.organizationId ?? null,
    organizationIsActive: input.organizationIsActive ?? null,
    profile: input.profile ?? null,
    role: input.role ?? null,
  };
}

export function userCanAuthenticate(user: AuthenticationUser) {
  if (!user.isActive) return false;
  if (user.type === "MASTER") return true;
  if (user.type === "STANDARD" && user.role && !user.organizationId) return true;
  if (!user.organizationId) return false;

  return user.organizationIsActive !== false;
}

export function userToDto(user: AuthenticationUser): AuthenticatedUserDto {
  const dto: AuthenticatedUserDto = {
    email: user.email,
    id: user.id,
    organizationId: user.organizationId,
    type: user.type,
  };

  if (user.role) dto.role = user.role;

  const profile = authenticatedUserProfileToDto(user.profile);
  if (profile) dto.profile = profile;

  return dto;
}
