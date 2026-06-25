import { z } from "zod";

export const requiredDocumentFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do documento.").max(120, "Máximo de 120 caracteres."),
  // Optional free-text instruction; an empty value is normalized to null before
  // it reaches the API.
  observations: z.string().trim().max(500, "Máximo de 500 caracteres."),
});

export type RequiredDocumentFormValues = z.infer<typeof requiredDocumentFormSchema>;
