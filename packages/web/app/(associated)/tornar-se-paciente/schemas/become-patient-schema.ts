import { z } from "zod";
import { isValidUf } from "@/lib/brazilian-ufs";

const requiredText = (message: string) => z.string().trim().min(1, message);

// Structured prescriber (médico): name, CRM and the CRM's UF. Optional at this
// preliminary intent, but when a name is given the CRM/UF must be complete.
const prescriberSchema = z
  .object({
    name: z.string().trim().optional(),
    crm: z.string().trim().optional(),
    uf: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    const hasAny = Boolean(value.name?.trim() || value.crm?.trim() || value.uf?.trim());
    if (!hasAny) return;

    if (!value.name?.trim()) {
      context.addIssue({ code: "custom", message: "Informe o nome do médico.", path: ["name"] });
    }
    if (!value.crm?.trim()) {
      context.addIssue({ code: "custom", message: "Informe o CRM.", path: ["crm"] });
    }
    if (!value.uf || !isValidUf(value.uf)) {
      context.addIssue({ code: "custom", message: "Selecione a UF do CRM.", path: ["uf"] });
    }
  });

// Simplified "become a patient" intent. Clinical documents are collected later,
// after the association reviews the request.
export const becomePatientSchema = z.object({
  condition: requiredText("Informe a condição ou diagnóstico principal."),
  prescriber: prescriberSchema,
  hasPrescription: z.enum(["sim", "nao"], { message: "Selecione uma opção." }),
  notes: z.string().trim().optional(),
  consent: z.boolean().refine((value) => value, "É necessário autorizar a análise dos dados."),
});

export type BecomePatientPayload = z.output<typeof becomePatientSchema>;
