import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import type { Organization } from "../../../organizations/domain/entities/Organization.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import type { Patient } from "../../../patients/domain/entities/Patient.js";
import { OrganizationDocumentApprovalLog } from "../../domain/entities/OrganizationDocumentApprovalLog.js";
import { OrganizationDocumentPatientApproval } from "../../domain/entities/OrganizationDocumentPatientApproval.js";
import { OrganizationRequiredDocument } from "../../domain/entities/OrganizationRequiredDocument.js";
import type {
  OrganizationDocumentApprovalLogReadModel,
  OrganizationDocumentApprovalLogRepository,
} from "../repositories/OrganizationDocumentApprovalLogRepository.js";
import type {
  OrganizationDocumentPatientApprovalReadModel,
  OrganizationDocumentPatientApprovalRepository,
} from "../repositories/OrganizationDocumentPatientApprovalRepository.js";
import type {
  OrganizationRequiredDocumentReadModel,
  OrganizationRequiredDocumentRepository,
} from "../repositories/OrganizationRequiredDocumentRepository.js";

const now = new Date("2026-06-22T12:00:00.000Z");

export const immediateUnitOfWork: UnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

export class SpyUnitOfWork implements UnitOfWork {
  executions = 0;

  execute<T>(work: () => Promise<T>): Promise<T> {
    this.executions += 1;
    return work();
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  readonly ids = new Set<string>();

  add(id: string): void {
    this.ids.add(id);
  }

  async findById(id: string): Promise<Organization | null> {
    return this.ids.has(id) ? ({} as Organization) : null;
  }

  async findByCnpj(): Promise<Organization | null> {
    throw new Error("Method not implemented.");
  }

  async findByCnpjExcludingId(): Promise<Organization | null> {
    throw new Error("Method not implemented.");
  }

  async findBySlug(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async findDetailsById(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async findAllDetails(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async create(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async save(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export class InMemoryPatientRepository implements PatientRepository {
  readonly patients = new Map<string, Patient>();

  add(organizationId: string, patientId: string): void {
    this.patients.set(`${organizationId}:${patientId}`, {} as Patient);
  }

  async findByIdInOrganization(organizationId: string, patientId: string): Promise<Patient | null> {
    return this.patients.get(`${organizationId}:${patientId}`) ?? null;
  }

  async findByDocument(): Promise<Patient | null> {
    throw new Error("Method not implemented.");
  }

  async create(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export class InMemoryRequiredDocumentRepository implements OrganizationRequiredDocumentRepository {
  readonly documents = new Map<string, OrganizationRequiredDocumentReadModel>();
  readonly approvalDocumentIds = new Set<string>();
  deleteCalls = 0;

  seed(input: { id: string; organizationId: string; name: string; observations?: string | null }): void {
    this.documents.set(input.id, {
      ...input,
      observations: input.observations ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  async findByIdInOrganization(
    organizationId: string,
    documentId: string,
  ): Promise<OrganizationRequiredDocument | null> {
    const record = this.documents.get(documentId);
    if (!record || record.organizationId !== organizationId) {
      return null;
    }

    return OrganizationRequiredDocument.create(record, record.id);
  }

  async findDetailsByIdInOrganization(
    organizationId: string,
    documentId: string,
  ): Promise<OrganizationRequiredDocumentReadModel | null> {
    const record = this.documents.get(documentId);
    return record && record.organizationId === organizationId ? record : null;
  }

  async findByNameInOrganization(
    organizationId: string,
    name: string,
  ): Promise<OrganizationRequiredDocument | null> {
    const record = [...this.documents.values()].find(
      (document) => document.organizationId === organizationId && document.name === name,
    );

    return record ? OrganizationRequiredDocument.create(record, record.id) : null;
  }

  async findByNameInOrganizationExcludingId(
    organizationId: string,
    name: string,
    documentId: string,
  ): Promise<OrganizationRequiredDocument | null> {
    const record = [...this.documents.values()].find(
      (document) =>
        document.organizationId === organizationId && document.name === name && document.id !== documentId,
    );

    return record ? OrganizationRequiredDocument.create(record, record.id) : null;
  }

  async findAllByOrganization(organizationId: string): Promise<OrganizationRequiredDocumentReadModel[]> {
    return [...this.documents.values()].filter((document) => document.organizationId === organizationId);
  }

  async create(
    document: OrganizationRequiredDocument,
  ): Promise<OrganizationRequiredDocumentReadModel> {
    const record = {
      id: document.id,
      organizationId: document.organizationId,
      name: document.name,
      observations: document.observations,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(record.id, record);
    return record;
  }

  async save(document: OrganizationRequiredDocument): Promise<OrganizationRequiredDocumentReadModel> {
    const previous = this.documents.get(document.id);
    const record = {
      id: document.id,
      organizationId: document.organizationId,
      name: document.name,
      observations: document.observations,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    this.documents.set(record.id, record);
    return record;
  }

  async delete(documentId: string): Promise<void> {
    this.deleteCalls += 1;
    this.documents.delete(documentId);
  }

  async hasApprovals(documentId: string): Promise<boolean> {
    return this.approvalDocumentIds.has(documentId);
  }
}

export class InMemoryApprovalRepository implements OrganizationDocumentPatientApprovalRepository {
  readonly approvals = new Map<string, OrganizationDocumentPatientApprovalReadModel>();
  readonly documentOrganizations = new Map<string, string>();

  seed(input: {
    id: string;
    documentId: string;
    patientId: string;
    organizationId: string;
    status?: OrganizationDocumentPatientApprovalReadModel["status"];
    rejectedReason?: string | null;
  }): void {
    this.documentOrganizations.set(input.documentId, input.organizationId);
    this.approvals.set(input.id, {
      id: input.id,
      documentId: input.documentId,
      patientId: input.patientId,
      status: input.status ?? OrganizationDocumentPatientApproval.create(input).status,
      rejectedReason: input.rejectedReason ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  async findByIdForPatientInOrganization(
    organizationId: string,
    patientId: string,
    approvalId: string,
  ): Promise<OrganizationDocumentPatientApproval | null> {
    const record = this.approvals.get(approvalId);
    if (
      !record ||
      record.patientId !== patientId ||
      this.documentOrganizations.get(record.documentId) !== organizationId
    ) {
      return null;
    }

    return OrganizationDocumentPatientApproval.create(record, record.id);
  }

  async findDetailsByIdForPatientInOrganization(
    organizationId: string,
    patientId: string,
    approvalId: string,
  ): Promise<OrganizationDocumentPatientApprovalReadModel | null> {
    const record = this.approvals.get(approvalId);
    if (
      !record ||
      record.patientId !== patientId ||
      this.documentOrganizations.get(record.documentId) !== organizationId
    ) {
      return null;
    }

    return record;
  }

  async findByDocumentAndPatient(
    documentId: string,
    patientId: string,
  ): Promise<OrganizationDocumentPatientApproval | null> {
    const record = [...this.approvals.values()].find(
      (approval) => approval.documentId === documentId && approval.patientId === patientId,
    );

    return record ? OrganizationDocumentPatientApproval.create(record, record.id) : null;
  }

  async findAllByPatientInOrganization(
    organizationId: string,
    patientId: string,
  ): Promise<OrganizationDocumentPatientApprovalReadModel[]> {
    return [...this.approvals.values()].filter(
      (approval) =>
        approval.patientId === patientId &&
        this.documentOrganizations.get(approval.documentId) === organizationId,
    );
  }

  async create(
    approval: OrganizationDocumentPatientApproval,
  ): Promise<OrganizationDocumentPatientApprovalReadModel> {
    this.documentOrganizations.set(
      approval.documentId,
      this.documentOrganizations.get(approval.documentId) ?? "org-1",
    );
    const record = {
      id: approval.id,
      documentId: approval.documentId,
      patientId: approval.patientId,
      status: approval.status,
      rejectedReason: approval.rejectedReason,
      createdAt: now,
      updatedAt: now,
    };
    this.approvals.set(record.id, record);
    return record;
  }

  async save(
    approval: OrganizationDocumentPatientApproval,
  ): Promise<OrganizationDocumentPatientApprovalReadModel> {
    const previous = this.approvals.get(approval.id);
    const record = {
      id: approval.id,
      documentId: approval.documentId,
      patientId: approval.patientId,
      status: approval.status,
      rejectedReason: approval.rejectedReason,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    this.approvals.set(record.id, record);
    return record;
  }
}

export class InMemoryApprovalLogRepository implements OrganizationDocumentApprovalLogRepository {
  readonly logs: OrganizationDocumentApprovalLogReadModel[] = [];

  async create(log: OrganizationDocumentApprovalLog): Promise<OrganizationDocumentApprovalLogReadModel> {
    const record = {
      id: log.id,
      action: log.action,
      patientApprovalId: log.patientApprovalId,
      organizationUserId: log.organizationUserId,
      createdAt: now,
    };
    this.logs.push(record);
    return record;
  }

  async findAllByPatientApproval(
    patientApprovalId: string,
  ): Promise<OrganizationDocumentApprovalLogReadModel[]> {
    return this.logs.filter((log) => log.patientApprovalId === patientApprovalId);
  }
}
