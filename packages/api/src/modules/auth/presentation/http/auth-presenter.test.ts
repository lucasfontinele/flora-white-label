import { describe, expect, it } from "vitest";
import { AuthPresenter } from "./auth-presenter.js";

describe("AuthPresenter", () => {
  it("returns the public login response without password material", () => {
    const output = AuthPresenter.loginToHttp({
      accessToken: "signed-access-token",
      user: {
        id: "user-1",
        email: "user@example.com",
        profile: "Organization",
        organizationId: "org-1",
        guardianId: null,
        patientId: null,
        organizationEmployeeId: "employee-1",
      },
      context: {
        view: "Organization",
        organizationId: "org-1",
        guardianId: null,
        patientId: null,
        organizationEmployeeId: "employee-1",
        guardian: null,
        patient: null,
        employee: { id: "employee-1", fullName: "Maria Operadora", document: "52998224725", isActive: true },
        managedPatients: [],
      },
    });

    expect(output).toEqual({
      accessToken: "signed-access-token",
      user: {
        id: "user-1",
        email: "user@example.com",
        profile: "Organization",
        organizationId: "org-1",
        guardianId: null,
        patientId: null,
        organizationEmployeeId: "employee-1",
      },
      context: {
        view: "Organization",
        organizationId: "org-1",
        guardianId: null,
        patientId: null,
        organizationEmployeeId: "employee-1",
        guardian: null,
        patient: null,
        employee: { id: "employee-1", fullName: "Maria Operadora", document: "52998224725", isActive: true },
        managedPatients: [],
      },
    });
    expect(JSON.stringify(output)).not.toContain("passwordHash");
    expect(JSON.stringify(output)).not.toContain("hashed");
  });
});
