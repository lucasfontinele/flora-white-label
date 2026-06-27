import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { RegistrationType } from "../../domain/enums/RegistrationType.js";
import {
  patientRegistrationBodyJsonSchema,
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

const prescribers = [{ fullName: "Dra. Helena Costa", crm: "123456", crmState: "SP" }];

describe("patient registration schemas", () => {
  it("accepts Patient payloads without guardian data", () => {
    const result = patientRegistrationBodySchemaDiscriminated.safeParse({
      registrationType: RegistrationType.Patient,
      user,
      patient,
      prescribers,
    });

    expect(result.success).toBe(true);
  });

  it("rejects Patient payloads without a prescriber", () => {
    const result = patientRegistrationBodySchemaDiscriminated.safeParse({
      registrationType: RegistrationType.Patient,
      user,
      patient,
      prescribers: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a prescriber with an invalid UF", () => {
    const result = patientRegistrationBodySchemaDiscriminated.safeParse({
      registrationType: RegistrationType.Patient,
      user,
      patient,
      prescribers: [{ fullName: "Dr. X", crm: "1", crmState: "XX" }],
    });

    expect(result.success).toBe(false);
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
      prescribers,
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

// Regression: the body JSON schema must accept each profile through Fastify's
// AJV layer. A previous version used `additionalProperties: false` per branch,
// which `removeAdditional` mutated inside `oneOf`, breaking LegalGuardian.
describe("patient registration body JSON schema (Fastify/AJV layer)", () => {
  async function validate(body: unknown): Promise<number> {
    const app = Fastify();
    app.post("/t", { schema: { body: patientRegistrationBodyJsonSchema } }, async () => ({ ok: true }));
    const response = await app.inject({ method: "POST", url: "/t", payload: body as object });
    await app.close();
    return response.statusCode;
  }

  it("accepts a LegalGuardian body with guardian and patient", async () => {
    await expect(
      validate({
        registrationType: RegistrationType.LegalGuardian,
        user,
        guardian,
        patient: { ...patient, underPrivileged: true },
        prescribers,
      }),
    ).resolves.toBe(200);
  });

  it("accepts Patient and PetTutor bodies", async () => {
    await expect(
      validate({ registrationType: RegistrationType.Patient, user, patient, prescribers }),
    ).resolves.toBe(200);
    await expect(validate({ registrationType: RegistrationType.PetTutor, user, guardian })).resolves.toBe(200);
  });

  it("rejects a Patient body without prescribers", async () => {
    await expect(
      validate({ registrationType: RegistrationType.Patient, user, patient }),
    ).resolves.toBe(400);
  });

  it("rejects a LegalGuardian body missing the guardian", async () => {
    await expect(
      validate({ registrationType: RegistrationType.LegalGuardian, user, patient }),
    ).resolves.toBe(400);
  });
});
