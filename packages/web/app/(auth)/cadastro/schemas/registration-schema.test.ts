import { describe, expect, it } from "vitest";
import { registrationSchema, toPatientRegistrationBody, type RegistrationSchema } from "./registration-schema";

const baseData: RegistrationSchema = {
  role: "patient",
  fullName: "  Maria Silva  ",
  cpf: "390.533.447-05",
  birthDate: "15/03/1990",
  nickname: "",
  gender: "feminino",
  underPrivileged: true,
  email: "Maria@Example.com ",
  password: "senha1234",
  passwordConfirmation: "senha1234",
  phone: "(63) 99999-0000",
  cep: "77001-000",
  street: "Quadra 101",
  number: "10",
  complement: "",
  neighborhood: "Centro",
  state: "TO",
  city: "Palmas",
  guardianFullName: "",
  guardianCpf: "",
  guardianRg: "",
  guardianRelationship: "pai_mae",
  guardianGender: "prefiro_nao_informar",
  guardianBirthDate: "",
  guardianPhone: "",
  guardianCep: "",
  guardianStreet: "",
  guardianNumber: "",
  guardianComplement: "",
  guardianNeighborhood: "",
  guardianState: "",
  guardianCity: "",
  petName: "",
  petSpecies: "",
  petBreed: "",
  petBirthDate: "",
  petDiagnosis: "",
  prescribers: [{ name: "Dra. Helena Costa", crm: "123456", uf: "SP" }],
};

describe("toPatientRegistrationBody", () => {
  it("maps a self patient: normalizes gender, document, ISO birthdate and email", () => {
    const body = toPatientRegistrationBody(baseData);

    expect(body).toEqual({
      registrationType: "Patient",
      user: { email: "maria@example.com", password: "senha1234" },
      patient: {
        name: "Maria Silva",
        document: "39053344705",
        birthdate: "1990-03-15",
        gender: "F",
        underPrivileged: true,
      },
      prescribers: [{ fullName: "Dra. Helena Costa", crm: "123456", crmState: "SP" }],
    });
  });

  it("maps a legal guardian: separate guardian + patient, each with its own gender", () => {
    const body = toPatientRegistrationBody({
      ...baseData,
      role: "legal_guardian",
      underPrivileged: false,
      guardianFullName: "João Souza",
      guardianCpf: "111.444.777-35",
      guardianBirthDate: "20/12/1980",
      guardianGender: "masculino",
    });

    expect(body).toEqual({
      registrationType: "LegalGuardian",
      user: { email: "maria@example.com", password: "senha1234" },
      guardian: { name: "João Souza", document: "11144477735", birthdate: "1980-12-20", gender: "M" },
      patient: {
        name: "Maria Silva",
        document: "39053344705",
        birthdate: "1990-03-15",
        gender: "F",
        underPrivileged: false,
      },
      prescribers: [{ fullName: "Dra. Helena Costa", crm: "123456", crmState: "SP" }],
    });
  });

  it("maps a pet tutor: only user + guardian, no patient or pet data", () => {
    const body = toPatientRegistrationBody({ ...baseData, role: "pet_tutor", gender: "outro" });

    expect(body).toEqual({
      registrationType: "PetTutor",
      user: { email: "maria@example.com", password: "senha1234" },
      guardian: { name: "Maria Silva", document: "39053344705", birthdate: "1990-03-15", gender: "O" },
    });
    expect(body).not.toHaveProperty("patient");
  });
});

describe("registrationSchema defaults", () => {
  it("defaults underPrivileged to false and guardianGender when omitted", () => {
    const parsed = registrationSchema.parse({
      role: "patient",
      fullName: "Maria Silva",
      cpf: "390.533.447-05",
      birthDate: "15/03/1990",
      gender: "feminino",
      email: "maria@example.com",
      password: "senha1234",
      passwordConfirmation: "senha1234",
      phone: "(63) 99999-0000",
      cep: "77001-000",
      street: "Quadra 101",
      number: "10",
      neighborhood: "Centro",
      state: "TO",
      city: "Palmas",
      prescribers: [{ name: "Dra. Helena Costa", crm: "123456", uf: "SP" }],
    });

    expect(parsed.underPrivileged).toBe(false);
    expect(parsed.guardianGender).toBe("prefiro_nao_informar");
  });
});

describe("registrationSchema prescriber validation", () => {
  // baseData carries a not-yet-normalized email (trailing space) that the mapper
  // tests pass through directly; safeParse runs email validation, so use a clean one.
  const parseable = { ...baseData, email: "maria@example.com" };

  it("rejects a patient registration without a valid prescriber", () => {
    const result = registrationSchema.safeParse({ ...parseable, prescribers: [{ name: "", crm: "", uf: "" }] });

    expect(result.success).toBe(false);
  });

  it("rejects a prescriber with an invalid UF", () => {
    const result = registrationSchema.safeParse({
      ...parseable,
      prescribers: [{ name: "Dra. Helena Costa", crm: "123456", uf: "XX" }],
    });

    expect(result.success).toBe(false);
  });

  it("does not require a prescriber for a pet tutor", () => {
    const result = registrationSchema.safeParse({
      ...parseable,
      role: "pet_tutor",
      petName: "Totó",
      petSpecies: "Canina",
      prescribers: [{ name: "", crm: "", uf: "" }],
    });

    expect(result.success).toBe(true);
  });
});
