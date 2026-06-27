import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import type { PatientPrescriptionRepository } from "../../../prescriptions/application/repositories/PatientPrescriptionRepository.js";
import type { OrganizationDocumentPatientApprovalRepository } from "../repositories/OrganizationDocumentPatientApprovalRepository.js";
import type { OrganizationRequiredDocumentRepository } from "../repositories/OrganizationRequiredDocumentRepository.js";

export interface RefreshPatientRegistrationStatusInput {
  organizationId: string;
  patientId: string;
}

export interface RefreshPatientRegistrationStatusOutput {
  /** The patient's status after the refresh (unchanged when nothing applied). */
  patientStatus: PatientStatus | null;
  changed: boolean;
}

export interface RefreshPatientRegistrationStatusDependencies {
  patientRepository: PatientRepository;
  prescriptionRepository: PatientPrescriptionRepository;
  requiredDocumentRepository: OrganizationRequiredDocumentRepository;
  approvalRepository: OrganizationDocumentPatientApprovalRepository;
  unitOfWork: UnitOfWork;
}

/**
 * Keeps a patient's registration status honest. Demotes an approved/awaiting
 * patient back to WAITING_DOCUMENTS when either:
 * - a required document is still pending submission (not uploaded), or
 * - (approved patients only) the receita is missing or expired.
 *
 * Run idempotently on every `/me` hit. WAITING_DOCUMENTS and REJECTED patients
 * are left untouched (nothing to demote; rejection is an operator decision).
 */
export class RefreshPatientRegistrationStatusUseCase {
  constructor(private readonly deps: RefreshPatientRegistrationStatusDependencies) {}

  async execute(
    input: RefreshPatientRegistrationStatusInput,
  ): Promise<RefreshPatientRegistrationStatusOutput> {
    const patient = await this.deps.patientRepository.findByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient) {
      return { patientStatus: null, changed: false };
    }

    const status = patient.patientStatus;
    if (status === PatientStatus.WaitingDocuments || status === PatientStatus.Rejected) {
      return { patientStatus: status, changed: false };
    }

    const hasPendingDocuments = await this.hasPendingDocuments(
      input.organizationId,
      input.patientId,
    );

    let prescriptionExpired = false;
    if (status === PatientStatus.Approval) {
      const prescription = await this.deps.prescriptionRepository.findDetailsByPatient(
        input.organizationId,
        input.patientId,
      );
      prescriptionExpired = !prescription || prescription.validUntil.getTime() <= Date.now();
    }

    if (!hasPendingDocuments && !prescriptionExpired) {
      return { patientStatus: status, changed: false };
    }

    patient.revertToWaitingDocuments();
    await this.deps.unitOfWork.execute(() => this.deps.patientRepository.save(patient));

    return { patientStatus: patient.patientStatus, changed: true };
  }

  private async hasPendingDocuments(organizationId: string, patientId: string): Promise<boolean> {
    const requiredDocuments =
      await this.deps.requiredDocumentRepository.findAllByOrganization(organizationId);
    if (requiredDocuments.length === 0) {
      return false;
    }

    const approvals = await this.deps.approvalRepository.findAllByPatientInOrganization(
      organizationId,
      patientId,
    );
    const uploadedDocumentIds = new Set(
      approvals.filter((approval) => approval.storageKey).map((approval) => approval.documentId),
    );

    return requiredDocuments.some((document) => !uploadedDocumentIds.has(document.id));
  }
}
