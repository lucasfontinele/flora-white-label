import { z } from "zod";

const digits = (value: string) => value.replace(/\D/g, "");

const emailSchema = z.string().email("Informe um e-mail válido.");
const petSpeciesValues = ["Canina", "Felina", "Equina", "Aviária", "Exótica", "Silvestre", "Outras"] as const;

const registrationBaseSchema = z.object({
  role: z.enum(["pet_tutor", "legal_guardian", "patient"], {
    message: "Selecione o tipo de cadastro.",
  }),
  fullName: z.string().trim().min(3, "Informe o nome completo."),
  cpf: z
    .string()
    .optional()
    .refine((value) => !value || digits(value).length === 11, "Informe um CPF válido."),
  birthDate: z.string().refine((value) => digits(value).length === 8, "Informe a data de nascimento."),
  nickname: z.string().optional(),
  gender: z.enum(["masculino", "feminino", "outro", "prefiro_nao_informar"], {
    message: "Selecione uma opção de gênero.",
  }),
  email: emailSchema,
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
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
  guardianRelationship: z.enum(["pai_mae", "tutor"]).optional(),
  guardianBirthDate: z.string().optional(),
  guardianEmail: z.string().optional(),
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
  petBreed: z.string().optional(),
  petBirthDate: z.string().optional(),
  petDiagnosis: z.string().optional(),
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

  if (data.role === "pet_tutor") {
    if (digits(data.cpf ?? "").length !== 11) {
      addIssue("cpf", "Informe um CPF válido.");
    }

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

  if (digits(data.guardianCpf ?? "").length !== 11) {
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

  if (!data.guardianEmail || !emailSchema.safeParse(data.guardianEmail).success) {
    addIssue("guardianEmail", "Informe um e-mail válido.");
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
