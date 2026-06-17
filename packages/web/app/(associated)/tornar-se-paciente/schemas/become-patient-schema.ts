import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

// Simplified "become a patient" intent. Clinical documents are collected later,
// after the association reviews the request.
export const becomePatientSchema = z.object({
  condition: requiredText("Informe a condição ou diagnóstico principal."),
  prescriber: z.string().trim().optional(),
  hasPrescription: z.enum(["sim", "nao"], { message: "Selecione uma opção." }),
  notes: z.string().trim().optional(),
  consent: z.boolean().refine((value) => value, "É necessário autorizar a análise dos dados."),
});

export type BecomePatientPayload = z.output<typeof becomePatientSchema>;
