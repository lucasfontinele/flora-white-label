/**
 * Lifecycle of an employee invitation:
 * - PENDING: sent, awaiting the invitee to complete their registration.
 * - ACCEPTED: the invitee completed registration (employee + user created).
 * - EXPIRED: the invitation passed its expiration without being accepted.
 * - REVOKED: the organization cancelled the invitation.
 */
export enum InvitationStatus {
  Pending = "PENDING",
  Accepted = "ACCEPTED",
  Expired = "EXPIRED",
  Revoked = "REVOKED",
}
