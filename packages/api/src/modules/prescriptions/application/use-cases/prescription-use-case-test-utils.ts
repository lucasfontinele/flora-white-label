import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import type { Organization } from "../../../organizations/domain/entities/Organization.js";
import type {
  PatientReadModel,
  PatientRepository,
} from "../../../patients/application/repositories/PatientRepository.js";
import { Patient } from "../../../patients/domain/entities/Patient.js";
import { Gender } from "../../../../shared/domain/enums/Gender.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import { PatientPrescription } from "../../domain/entities/PatientPrescription.js";
import type {
  PatientPrescriptionReadModel,
  PatientPrescriptionRepository,
} from "../repositories/PatientPrescriptionRepository.js";

const now = new Date("2026-06-25T12:00:00.000Z");

export const immediateUnitOfWork: UnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

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

// A check-digit-valid CPF, reused for all in-memory test patients.
const TEST_CPF = "52998224725";

export class InMemoryPatientRepository implements PatientRepository {
  readonly patients = new Map<string, Patient>();

  add(organizationId: string, patientId: string, name = "Paciente Teste"): void {
    this.patients.set(
      patientId,
      Patient.create(
        {
          organizationId,
          name,
          document: Document.create(TEST_CPF),
          birthdate: new Date("2000-01-01T00:00:00.000Z"),
          gender: Gender.Male,
          underPrivileged: false,
        },
        patientId,
      ),
    );
  }

  async findByIdInOrganization(organizationId: string, patientId: string): Promise<Patient | null> {
    const patient = this.patients.get(patientId);
    return patient && patient.organizationId === organizationId ? patient : null;
  }

  async findDetailsByIdInOrganization(): Promise<PatientReadModel | null> {
    throw new Error("Method not implemented.");
  }

  async findManyByOrganization(): Promise<PatientReadModel[]> {
    throw new Error("Method not implemented.");
  }

  async findByDocument(): Promise<Patient | null> {
    throw new Error("Method not implemented.");
  }

  async create(patient: Patient): Promise<void> {
    this.patients.set(patient.id, patient);
  }

  async save(patient: Patient): Promise<void> {
    this.patients.set(patient.id, patient);
  }
}

export class InMemoryPatientPrescriptionRepository implements PatientPrescriptionRepository {
  readonly prescriptions = new Map<string, PatientPrescriptionReadModel>();
  readonly patientNames = new Map<string, string>();
  deleteCalls = 0;

  seed(input: {
    id: string;
    organizationId: string;
    patientId: string;
    patientName?: string;
    validUntil: Date;
    observations?: string | null;
  }): void {
    this.prescriptions.set(input.id, {
      id: input.id,
      organizationId: input.organizationId,
      patientId: input.patientId,
      patientName: input.patientName ?? this.nameFor(input.patientId),
      validUntil: input.validUntil,
      observations: input.observations ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  private nameFor(patientId: string): string {
    return this.patientNames.get(patientId) ?? "Paciente Teste";
  }

  private findRecord(organizationId: string, patientId: string): PatientPrescriptionReadModel | undefined {
    return [...this.prescriptions.values()].find(
      (record) => record.organizationId === organizationId && record.patientId === patientId,
    );
  }

  async findByPatient(organizationId: string, patientId: string): Promise<PatientPrescription | null> {
    const record = this.findRecord(organizationId, patientId);
    return record ? PatientPrescription.create(record, record.id) : null;
  }

  async findDetailsByPatient(
    organizationId: string,
    patientId: string,
  ): Promise<PatientPrescriptionReadModel | null> {
    return this.findRecord(organizationId, patientId) ?? null;
  }

  async findAllByOrganization(organizationId: string): Promise<PatientPrescriptionReadModel[]> {
    return [...this.prescriptions.values()].filter(
      (record) => record.organizationId === organizationId,
    );
  }

  async create(prescription: PatientPrescription): Promise<PatientPrescriptionReadModel> {
    const record: PatientPrescriptionReadModel = {
      id: prescription.id,
      organizationId: prescription.organizationId,
      patientId: prescription.patientId,
      patientName: this.nameFor(prescription.patientId),
      validUntil: prescription.validUntil,
      observations: prescription.observations,
      createdAt: now,
      updatedAt: now,
    };
    this.prescriptions.set(record.id, record);
    return record;
  }

  async save(prescription: PatientPrescription): Promise<PatientPrescriptionReadModel> {
    const previous = this.prescriptions.get(prescription.id);
    const record: PatientPrescriptionReadModel = {
      id: prescription.id,
      organizationId: prescription.organizationId,
      patientId: prescription.patientId,
      patientName: previous?.patientName ?? this.nameFor(prescription.patientId),
      validUntil: prescription.validUntil,
      observations: prescription.observations,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    this.prescriptions.set(record.id, record);
    return record;
  }

  async delete(prescriptionId: string): Promise<void> {
    this.deleteCalls += 1;
    this.prescriptions.delete(prescriptionId);
  }
}
