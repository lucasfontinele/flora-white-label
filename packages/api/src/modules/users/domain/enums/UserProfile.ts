/**
 * Systemic profile of a `User`. These are authorization roles only — they carry
 * no personal data. Persisted values must match these strings exactly.
 */
export enum UserProfile {
  Master = "Master",
  Organization = "Organization",
  Patient = "Patient",
  Guardian = "Guardian",
}
