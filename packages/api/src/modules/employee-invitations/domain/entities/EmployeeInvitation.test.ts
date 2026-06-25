import { describe, expect, it } from "vitest";
import { EmployeeInvitation } from "./EmployeeInvitation.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { InvitationStatus } from "../enums/InvitationStatus.js";

function build() {
  return EmployeeInvitation.create({
    organizationId: "org-1",
    email: "Person@Flora.LOCAL",
    roleId: "role-1",
  });
}

describe("EmployeeInvitation", () => {
  it("creates a pending invitation with a normalized email and a token", () => {
    const invitation = build();

    expect(invitation.status).toBe(InvitationStatus.Pending);
    expect(invitation.email).toBe("person@flora.local");
    expect(invitation.token.length).toBeGreaterThan(20);
    expect(invitation.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(invitation.acceptedAt).toBeNull();
  });

  it("rejects a blank org/role and an invalid email", () => {
    expect(() => build()).not.toThrow();
    expect(() =>
      EmployeeInvitation.create({ organizationId: " ", email: "a@b.co", roleId: "r" }),
    ).toThrow(DomainValidationError);
    expect(() =>
      EmployeeInvitation.create({ organizationId: "o", email: "not-an-email", roleId: "r" }),
    ).toThrow(DomainValidationError);
  });

  it("resends with a fresh token and refreshed expiry", () => {
    const invitation = build();
    const firstToken = invitation.token;

    invitation.resend();

    expect(invitation.token).not.toBe(firstToken);
    expect(invitation.status).toBe(InvitationStatus.Pending);
  });

  it("accepts a pending, non-expired invitation and blocks re-accepting", () => {
    const invitation = build();

    invitation.accept();
    expect(invitation.status).toBe(InvitationStatus.Accepted);
    expect(invitation.acceptedAt).not.toBeNull();
    expect(() => invitation.accept()).toThrow(DomainValidationError);
    expect(() => invitation.resend()).toThrow(DomainValidationError);
  });

  it("rejects accepting an expired invitation", () => {
    const invitation = EmployeeInvitation.restore(
      {
        organizationId: "org-1",
        email: "person@flora.local",
        roleId: "role-1",
        token: "tok",
        status: InvitationStatus.Pending,
        expiresAt: new Date(Date.now() - 1000),
        acceptedAt: null,
        invitedByUserId: null,
      },
      "inv-1",
    );

    expect(invitation.isExpired()).toBe(true);
    expect(() => invitation.accept()).toThrow(DomainValidationError);
  });
});
