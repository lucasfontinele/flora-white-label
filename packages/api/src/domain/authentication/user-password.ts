import { ValidationException } from "../../exception/index.js";

export type PasswordPolicyResult = {
  isValid: boolean;
  issues: string[];
};

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const issues: string[] = [];

  if (password.length < 8) {
    issues.push("A senha deve ter ao menos 8 caracteres.");
  }

  if (!/[a-z]/.test(password)) {
    issues.push("A senha deve conter ao menos uma letra minúscula.");
  }

  if (!/\d/.test(password)) {
    issues.push("A senha deve conter ao menos um número.");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

export function assertValidPasswordPolicy(password: string) {
  const result = validatePasswordPolicy(password);

  if (!result.isValid) {
    throw new ValidationException("Senha inválida.", result.issues);
  }
}

export function assertPasswordHash(passwordHash: string) {
  if (!passwordHash.trim()) {
    throw new ValidationException("Senha protegida obrigatória.");
  }
}
