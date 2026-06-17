import { DomainValidationError } from "../errors/DomainValidationError.js";

/**
 * Reusable gender enum shared by every person-like model (Guardian, Patient).
 * The persisted values must match these strings exactly.
 */
export enum Gender {
  Male = "M",
  Female = "F",
  Other = "O",
  NotInformed = "N/A",
}

/**
 * Maps an external gender code ("M" | "F" | "O" | "N/A") to the domain enum,
 * rejecting anything else.
 */
export function genderFromCode(code: string): Gender {
  switch (code) {
    case "M":
      return Gender.Male;
    case "F":
      return Gender.Female;
    case "O":
      return Gender.Other;
    case "N/A":
      return Gender.NotInformed;
    default:
      throw new DomainValidationError(`Invalid gender code: "${code}".`);
  }
}
