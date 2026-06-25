import type { AuthContextDto, AuthPatientContextDto } from "@flora/shared/authentication";
import type { PatientProfile } from "@/lib/data";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// The session context only carries id/name/relationshipLabel/document for each
// patient. The rest of the associated portal still renders the richer
// `PatientProfile` view-model, so we fill the not-yet-integrated fields with a
// neutral placeholder ("—") until each screen is wired to real data.
function toPatientProfile(patient: AuthPatientContextDto, relationship: string): PatientProfile {
  return {
    id: patient.id,
    name: patient.name,
    relationship: patient.relationshipLabel || relationship,
    initials: initialsOf(patient.name),
    memberId: "—",
    birthDate: "—",
    condition: "—",
    registrationStatus: "Ativo",
    prescriptionDue: "—",
    anvisaDue: "—",
    nextReview: "—",
  };
}

/**
 * Builds the patient list shown in the associated portal from the real auth
 * context: a guardian's managed patients, or the logged-in patient themselves.
 * Falls back to a single placeholder derived from the account so the portal
 * never renders without a selectable patient.
 */
export function derivePatientProfiles(
  context: AuthContextDto,
  fallbackName: string,
): { patients: PatientProfile[]; defaultPatientId: string } {
  const source =
    context.managedPatients.length > 0
      ? context.managedPatients
      : context.patient
        ? [context.patient]
        : [];

  const patients = source.map((patient) => toPatientProfile(patient, "Paciente"));

  if (patients.length === 0) {
    const name = fallbackName.trim() || "Paciente";
    patients.push({
      id: context.patientId ?? "self",
      name,
      relationship: "Responsável",
      initials: initialsOf(name),
      memberId: "—",
      birthDate: "—",
      condition: "—",
      registrationStatus: "Ativo",
      prescriptionDue: "—",
      anvisaDue: "—",
      nextReview: "—",
    });
  }

  const defaultPatientId =
    (context.patientId && patients.some((patient) => patient.id === context.patientId)
      ? context.patientId
      : patients[0]?.id) ?? "";

  return { patients, defaultPatientId };
}
