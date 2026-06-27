import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { Gender } from "../../../../shared/domain/enums/Gender.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import type {
  PatientReadModel,
  PatientRepository,
} from "../../../patients/application/repositories/PatientRepository.js";
import { Patient } from "../../../patients/domain/entities/Patient.js";
import { Prescriber } from "../../domain/entities/Prescriber.js";
import type {
  PrescriberReadModel,
  PrescriberRepository,
} from "../repositories/PrescriberRepository.js";

const now = new Date("2026-06-26T12:00:00.000Z");

export const immediateUnitOfWork: UnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

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

export class InMemoryPrescriberRepository implements PrescriberRepository {
  readonly prescribers = new Map<string, Prescriber>();
  readonly timestamps = new Map<string, { createdAt: Date; updatedAt: Date }>();
  deleteCalls = 0;

  seed(prescriber: Prescriber): void {
    this.prescribers.set(prescriber.id, prescriber);
    this.timestamps.set(prescriber.id, { createdAt: now, updatedAt: now });
  }

  private toReadModel(prescriber: Prescriber): PrescriberReadModel {
    const ts = this.timestamps.get(prescriber.id) ?? { createdAt: now, updatedAt: now };
    return {
      id: prescriber.id,
      organizationId: prescriber.organizationId,
      patientId: prescriber.patientId,
      fullName: prescriber.fullName,
      crm: prescriber.crm,
      crmState: prescriber.crmState,
      createdAt: ts.createdAt,
      updatedAt: ts.updatedAt,
    };
  }

  async findById(id: string): Promise<Prescriber | null> {
    return this.prescribers.get(id) ?? null;
  }

  async findByPatient(organizationId: string, patientId: string): Promise<PrescriberReadModel[]> {
    return [...this.prescribers.values()]
      .filter(
        (prescriber) =>
          prescriber.organizationId === organizationId && prescriber.patientId === patientId,
      )
      .map((prescriber) => this.toReadModel(prescriber));
  }

  async create(prescriber: Prescriber): Promise<PrescriberReadModel> {
    this.prescribers.set(prescriber.id, prescriber);
    this.timestamps.set(prescriber.id, { createdAt: now, updatedAt: now });
    return this.toReadModel(prescriber);
  }

  async save(prescriber: Prescriber): Promise<PrescriberReadModel> {
    this.prescribers.set(prescriber.id, prescriber);
    const previous = this.timestamps.get(prescriber.id);
    this.timestamps.set(prescriber.id, {
      createdAt: previous?.createdAt ?? now,
      updatedAt: new Date(now.getTime() + 1),
    });
    return this.toReadModel(prescriber);
  }

  async delete(id: string): Promise<void> {
    this.deleteCalls += 1;
    this.prescribers.delete(id);
  }
}
