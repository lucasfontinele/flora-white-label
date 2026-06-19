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
    });

    expect(parsed.underPrivileged).toBe(false);
    expect(parsed.guardianGender).toBe("prefiro_nao_informar");
  });
});
