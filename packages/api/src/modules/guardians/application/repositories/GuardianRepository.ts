import type { Guardian } from "../../domain/entities/Guardian.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";

export interface GuardianRepository {
  findByDocument(organizationId: string, document: Document): Promise<Guardian | null>;
  create(guardian: Guardian): Promise<void>;
}
