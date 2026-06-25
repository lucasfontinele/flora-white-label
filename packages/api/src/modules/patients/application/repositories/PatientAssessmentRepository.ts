import type { PatientAssessment } from "../../domain/entities/PatientAssessment.js";

export interface PatientAssessmentRepository {
  create(patientAssessment: PatientAssessment): Promise<void>;
}
