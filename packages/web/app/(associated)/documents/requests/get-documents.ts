import { associatedDocuments } from "@/lib/data";

export async function getDocuments(patientId?: string) {
  if (!patientId) return associatedDocuments;

  return associatedDocuments.filter((document) => document.patientId === patientId);
}
