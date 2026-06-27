import { z } from "zod";
import { BRAZILIAN_UFS, isValidUf } from "@/lib/brazilian-ufs";
import type { ApiGender, PatientRegistrationBody } from "../types";

const digits = (value: string) => value.replace(/\D/g, "");
const isValidCpf = (value: string) => {
  const cpf = digits(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const numbers = cpf.split("").map(Number);
  const calculateDigit = (length: number) => {
    const sum = numbers.slice(0, length).reduce((acc, digit, index) => acc + digit * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === numbers[9] && calculateDigit(10) === numbers[10];
};

const emailSchema = z.string().email("Informe um e-mail válido.");
const petSpeciesValues = ["Canina", "Felina", "Equina", "Aviária", "Exótica", "Silvestre", "Outras"] as const;

const prescriberFieldSchema = z.object({
  name: z.string().trim(),
  crm: z.string().trim(),
  uf: z.string().trim(),
});

const registrationBaseSchema = z.object({
  role: z.enum(["pet_tutor", "legal_guardian", "patient"], {
    message: "Selecione o tipo de cadastro.",
  }),
  fullName: z.string().trim().min(3, "Informe o nome completo."),
  cpf: z
    .string()
    .refine((value) => isValidCpf(value), "Informe um CPF válido."),
  birthDate: z.string().refine((value) => digits(value).length === 8, "Informe a data de nascimento."),
  nickname: z.string().optional(),
  gender: z.enum(["masculino", "feminino", "outro", "prefiro_nao_informar"], {
    message: "Selecione uma opção de gênero.",
  }),
  underPrivileged: z.boolean().default(false),
  email: emailSchema,
  password: z
    .string()
    .min(8, "A senha deve ter ao menos 8 caracteres.")
    .regex(/[a-z]/, "A senha deve ter ao menos uma letra minúscula.")
    .regex(/\d/, "A senha deve ter ao menos um número."),
  passwordConfirmation: z.string().min(1, "Confirme a senha."),
  phone: z.string().refine((value) => {
    const length = digits(value).length;
    return length === 10 || length === 11;
  }, "Informe um telefone válido."),
  cep: z.string().refine((value) => digits(value).length === 8, "Informe um CEP válido."),
  street: z.string().trim().min(2, "Informe a rua."),
  number: z.string().trim().min(1, "Informe o número."),
  complement: z.string().optional(),
  neighborhood: z.string().trim().min(2, "Informe o bairro."),
  state: z.string().trim().length(2, "Informe a UF."),
  city: z.string().trim().min(2, "Informe a cidade."),
  guardianFullName: z.string().optional(),
  guardianCpf: z.string().optional(),
  guardianRg: z.string().optional(),
  guardianRelationship: z.enum(["pai_mae", "tutor", "filho", "cuidador", "procurador"]).optional(),
  guardianGender: z
    .enum(["masculino", "feminino", "outro", "prefiro_nao_informar"])
    .default("prefiro_nao_informar"),
  guardianBirthDate: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianCep: z.string().optional(),
  guardianStreet: z.string().optional(),
  guardianNumber: z.string().optional(),
  guardianComplement: z.string().optional(),
  guardianNeighborhood: z.string().optional(),
  guardianState: z.string().optional(),
  guardianCity: z.string().optional(),
  petName: z.string().optional(),
  petSpecies: z.string().optional(),
  petBreed: z.string().max(100, "A raça deve ter no máximo 100 caracteres.").optional(),
  petBirthDate: z.string().optional(),
  petDiagnosis: z.string().optional(),
  // Prescritores (médicos) atrelados ao paciente. Obrigatório para os perfis
  // que criam um paciente (paciente e responsável legal); ignorado para tutor.
  prescribers: z.array(prescriberFieldSchema).default([{ name: "", crm: "", uf: "" }]),
});

export const registrationSchema = registrationBaseSchema.superRefine((data, context) => {
  const addIssue = (path: keyof z.infer<typeof registrationBaseSchema>, message: string) => {
    context.addIssue({
      code: "custom",
      message,
      path: [path],
    });
  };

  const hasText = (value?: string) => Boolean(value?.trim());

  if (data.password && data.password !== data.passwordConfirmation) {
    addIssue("passwordConfirmation", "As senhas não conferem.");
  }

  // Prescritor é obrigatório quando o cadastro cria um paciente.
  if (data.role === "patient" || data.role === "legal_guardian") {
    if (data.prescribers.length === 0) {
      context.addIssue({ code: "custom", message: "Adicione ao menos um prescritor.", path: ["prescribers"] });
    }

    data.prescribers.forEach((prescriber, index) => {
      if (!prescriber.name || prescriber.name.trim().length < 3) {
        context.addIssue({
          code: "custom",
          message: "Informe o nome do médico prescritor.",
          path: ["prescribers", index, "name"],
        });
      }
      if (!prescriber.crm || prescriber.crm.trim().length === 0) {
        context.addIssue({ code: "custom", message: "Informe o CRM.", path: ["prescribers", index, "crm"] });
      }
      if (!isValidUf(prescriber.uf)) {
        context.addIssue({ code: "custom", message: "Selecione a UF do CRM.", path: ["prescribers", index, "uf"] });
      }
    });
  }

  if (data.role === "pet_tutor") {
    if (!hasText(data.petName) || data.petName!.trim().length < 2) {
      addIssue("petName", "Informe o nome do PET.");
    }

    if (!petSpeciesValues.includes(data.petSpecies as (typeof petSpeciesValues)[number])) {
      addIssue("petSpecies", "Selecione a espécie do PET.");
    }

    if (hasText(data.petBirthDate) && digits(data.petBirthDate ?? "").length !== 8) {
      addIssue("petBirthDate", "Informe a data de nascimento do PET.");
    }
  }

  if (data.role !== "legal_guardian") return;

  if (!hasText(data.guardianFullName) || data.guardianFullName!.trim().length < 3) {
    addIssue("guardianFullName", "Informe o nome completo do responsável.");
  }

  if (!isValidCpf(data.guardianCpf ?? "")) {
    addIssue("guardianCpf", "Informe um CPF válido.");
  }

  if (!hasText(data.guardianRg)) {
    addIssue("guardianRg", "Informe o RG.");
  }

  if (!data.guardianRelationship) {
    addIssue("guardianRelationship", "Selecione o parentesco.");
  }

  if (digits(data.guardianBirthDate ?? "").length !== 8) {
    addIssue("guardianBirthDate", "Informe a data de nascimento.");
  }

  const guardianPhoneLength = digits(data.guardianPhone ?? "").length;
  if (guardianPhoneLength !== 10 && guardianPhoneLength !== 11) {
    addIssue("guardianPhone", "Informe um telefone válido.");
  }

  if (digits(data.guardianCep ?? "").length !== 8) {
    addIssue("guardianCep", "Informe um CEP válido.");
  }

  if (!hasText(data.guardianStreet) || data.guardianStreet!.trim().length < 2) {
    addIssue("guardianStreet", "Informe a rua.");
  }

  if (!hasText(data.guardianNumber)) {
    addIssue("guardianNumber", "Informe o número.");
  }

  if (!hasText(data.guardianNeighborhood) || data.guardianNeighborhood!.trim().length < 2) {
    addIssue("guardianNeighborhood", "Informe o bairro.");
  }

  if (!data.guardianState || data.guardianState.trim().length !== 2) {
    addIssue("guardianState", "Informe a UF.");
  }

  if (!hasText(data.guardianCity) || data.guardianCity!.trim().length < 2) {
    addIssue("guardianCity", "Informe a cidade.");
  }
});

export type RegistrationSchema = z.infer<typeof registrationSchema>;

const genderToApi: Record<RegistrationSchema["gender"], ApiGender> = {
  masculino: "M",
  feminino: "F",
  outro: "O",
  prefiro_nao_informar: "N/A",
};

// "DD/MM/YYYY" (masked) → "YYYY-MM-DD" (ISO date expected by the API).
function toIsoDate(value: string): string {
  const onlyDigits = digits(value);
  if (onlyDigits.length !== 8) return value;

  return `${onlyDigits.slice(4, 8)}-${onlyDigits.slice(2, 4)}-${onlyDigits.slice(0, 2)}`;
}

function toPerson(input: { name: string; document: string; birthDate: string; gender: RegistrationSchema["gender"] }) {
  return {
    name: input.name.trim(),
    document: digits(input.document),
    birthdate: toIsoDate(input.birthDate),
    gender: genderToApi[input.gender],
  };
}

/**
 * Maps the rich registration form to the API payload. The shape is chosen by
 * the selected profile (`role` → `registrationType`); fields the API does not
 * accept (phone, address, pet, nickname, RG, relationship) are intentionally
 * omitted because the registration endpoint validates strictly.
 */
export function toPatientRegistrationBody(data: RegistrationSchema): PatientRegistrationBody {
  const user = { email: data.email.trim().toLowerCase(), password: data.password };
  const mainPerson = {
    name: data.fullName,
    document: data.cpf,
    birthDate: data.birthDate,
    gender: data.gender,
  };

  if (data.role === "pet_tutor") {
    // The tutor is the account holder; the pet itself is not part of this payload.
    return { registrationType: "PetTutor", user, guardian: toPerson(mainPerson) };
  }

  const patient = { ...toPerson(mainPerson), underPrivileged: data.underPrivileged };
  const prescribers = data.prescribers.map((prescriber) => ({
    fullName: prescriber.name.trim(),
    crm: prescriber.crm.trim(),
    crmState: prescriber.uf.trim().toUpperCase(),
  }));

  if (data.role === "legal_guardian") {
    return {
      registrationType: "LegalGuardian",
      user,
      guardian: toPerson({
        name: data.guardianFullName ?? "",
        document: data.guardianCpf ?? "",
        birthDate: data.guardianBirthDate ?? "",
        gender: data.guardianGender,
      }),
      patient,
      prescribers,
    };
  }

  return { registrationType: "Patient", user, patient, prescribers };
}
