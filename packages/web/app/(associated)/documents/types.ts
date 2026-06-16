export type DocumentStatus = "Aprovado" | "Em análise" | "Recusado";

export type AssociatedDocument = {
  patientId: string;
  name: string;
  due: string;
  status: DocumentStatus;
};
