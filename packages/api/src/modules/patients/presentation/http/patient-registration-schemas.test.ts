import { describe, expect, it } from "vitest";
import { RegistrationType } from "../../domain/enums/RegistrationType.js";
import {
  patientRegistrationBodySchemaDiscriminated,
  patientRegistrationParamsSchema,
} from "./patient-registration-schemas.js";

const user = {
  email: "person@example.com",
  password: "secret123",
};

const guardian = {
  name: "Guardian Name",
  document: "529.982.247-25",
  birthdate: "1980-01-01",
  gender: "F",
};

const patient = {
  name: "Patient Name",
  document: "111.444.777-35",
  birthdate: "1995-01-01",
  gender: "M",
  underPrivileged: false,
};

describe("patient registration schemas", () => {
  it("accepts Patient payloads without guardian data", () => {
    const result = patientRegistrationBodySchemaDiscriminated.safeParse({
      registrationType: RegistrationType.Patient,
      user,
      patient,
    });

    expect(result.success).toBe(true);
  });

  it("rejects Patient payloads with guardian data", () => {
    const result = patientRegistrationBodySchemaDiscriminated.safeParse({
      registrationType: RegistrationType.Patient,
      user,
      guardian,
      patient,
    });

    expect(result.success).toBe(false);
  });

  it("accepts LegalGuardian payloads with guardian and patient data", () => {
    const result = patientRegistrationBodySchemaDiscriminated.safeParse({
      registrationType: RegistrationType.LegalGuardian,
      user,
      guardian,
      patient: { ...patient, underPrivileged: true },
    });

    expect(result.success).toBe(true);
  });

  it("rejects LegalGuardian payloads without guardian data", () => {
    const result = patientRegistrationBodySchemaDiscriminated.safeParse({
      registrationType: RegistrationType.LegalGuardian,
      user,
      patient,
    });

    expect(result.success).toBe(false);
  });

  it("accepts PetTutor payloads without patient data", () => {
    const result = patientRegistrationBodySchemaDiscriminated.safeParse({
      registrationType: RegistrationType.PetTutor,
      user,
      guardian,
    });

    expect(result.success).toBe(true);
  });

  it("rejects PetTutor payloads with patient data", () => {
    const result = patientRegistrationBodySchemaDiscriminated.safeParse({
      registrationType: RegistrationType.PetTutor,
      user,
      guardian,
      patient,
    });

    expect(result.success).toBe(false);
  });

  it("validates organization params", () => {
    expect(patientRegistrationParamsSchema.safeParse({ organizationId: "org-1" }).success).toBe(
      true,
    );
    expect(patientRegistrationParamsSchema.safeParse({ organizationId: "" }).success).toBe(false);
  });
});
