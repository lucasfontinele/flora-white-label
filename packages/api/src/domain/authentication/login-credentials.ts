import { ValidationException } from "../../exception/index.js";
import { isValidEmail } from "../shared/validation.js";
import { normalizeEmail } from "./user.js";

export type LoginCredentials = {
  email: string;
  password: string;
};

export function parseLoginCredentials(input: unknown): LoginCredentials {
  if (!isRecord(input)) {
    throw new ValidationException("Credenciais inválidas.");
  }

  const email = normalizeEmail(readString(input.email));
  const password = readString(input.password);
  const issues: string[] = [];

  if (!isValidEmail(email)) issues.push("Informe um e-mail válido.");
  if (!password) issues.push("Informe sua senha.");

  if (issues.length > 0) {
    throw new ValidationException("Credenciais inválidas.", issues);
  }

  return { email, password };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}
