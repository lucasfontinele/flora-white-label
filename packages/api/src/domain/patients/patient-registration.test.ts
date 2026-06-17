import { describe, expect, it } from "vitest";
import { ValidationException } from "../../exception/index.js";
import { parsePatientRegistrationInput } from "./patient-registration.js";

const baseInput = {
  birthDate: "10/02/1990",
  cep: "77001-000",
  city: "Palmas",
  complement: "Apto 101",
  cpf: "529.982.247-25",
  email: " PACIENTE@flora.local ",
  fullName: "Maria Paciente",
  gender: "feminino",
  neighborhood: "Plano Diretor Sul",
  nickname: "Maria",
  number: "10",
  password: "acesso123",
  passwordConfirmation: "acesso123",
  phone: "(63) 99999-0000",
  role: "patient",
  state: "TO",
  street: "Quadra 101 Sul",
};

describe("parsePatientRegistrationInput", () => {
  it("maps a self-patient registration to a patient user and human patient", () => {
    const parsed = parsePatientRegistrationInput(baseInput, {
      now: new Date("2026-06-17T00:00:00.000Z"),
    });

    expect(parsed.user).toEqual({
      email: "paciente@flora.local",
      organizationId: null,
      password: "acesso123",
      role: "PATIENT",
    });
    expect(parsed.patient).toEqual(
      expect.objectContaining({
        document: "52998224725",
        fullName: "Maria Paciente",
        gender: "FEMININO",
        phone: "63999990000",
        type: "HUMANO",
      }),
    );
    expect(parsed.guardian).toBeUndefined();
  });

  it("maps a legal guardian registration to a tutor user and guardian link", () => {
    const parsed = parsePatientRegistrationInput(
      {
        ...baseInput,
        guardianBirthDate: "05/03/1970",
        guardianCep: "77002-000",
        guardianCity: "Palmas",
        guardianCpf: "111.444.777-35",
        guardianFullName: "Joao Responsavel",
        guardianNeighborhood: "Centro",
        guardianNumber: "20",
        guardianPhone: "(63) 99999-1111",
        guardianRelationship: "filho",
        guardianRg: "123456 SSP/TO",
        guardianState: "TO",
        guardianStreet: "Avenida Central",
        role: "legal_guardian",
      },
      { now: new Date("2026-06-17T00:00:00.000Z") },
    );

    expect(parsed.user.role).toBe("TUTOR");
    expect(parsed.patient.type).toBe("HUMANO");
    expect(parsed.guardian).toEqual(
      expect.objectContaining({
        document: "11144477735",
        fullName: "Joao Responsavel",
        phone: "63999991111",
        relationship: "FILHO",
        rg: "123456 SSP/TO",
      }),
    );
  });

  it("maps a pet tutor registration to an animal patient and pet details", () => {
    const parsed = parsePatientRegistrationInput(
      {
        ...baseInput,
        petBirthDate: "01/01/2020",
        petBreed: "SRD",
        petDiagnosis: "Dor crônica",
        petName: "Flor",
        petSpecies: "Canina",
        role: "pet_tutor",
      },
      { now: new Date("2026-06-17T00:00:00.000Z") },
    );

    expect(parsed.user.role).toBe("TUTOR");
    expect(parsed.patient).toEqual(
      expect.objectContaining({
        document: null,
        fullName: "Flor",
        gender: null,
        type: "ANIMAL",
      }),
    );
    expect(parsed.guardian).toEqual(
      expect.objectContaining({
        document: "52998224725",
        fullName: "Maria Paciente",
        relationship: "TUTOR",
      }),
    );
    expect(parsed.pet).toEqual(
      expect.objectContaining({
        breed: "SRD",
        diagnosis: "Dor crônica",
        name: "Flor",
        species: "CANINA",
      }),
    );
  });

  it("rejects invalid CPF data", () => {
    expect(() =>
      parsePatientRegistrationInput(
        {
          ...baseInput,
          cpf: "111.111.111-11",
        },
        { now: new Date("2026-06-17T00:00:00.000Z") },
      ),
    ).toThrow(ValidationException);
  });
});
