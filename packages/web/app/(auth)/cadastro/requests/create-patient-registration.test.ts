import { afterEach, describe, expect, it, vi } from "vitest";
import { createPatientRegistration } from "./create-patient-registration";
import type { PatientRegistrationBody } from "../types";

const body: PatientRegistrationBody = {
  registrationType: "Patient",
  user: { email: "maria@example.com", password: "senha1234" },
  patient: {
    name: "Maria Silva",
    document: "39053344705",
    birthdate: "1990-03-15",
    gender: "F",
    underPrivileged: false,
  },
};

const response = {
  userId: "user_1",
  guardianId: null,
  patientId: "patient_1",
  registrationType: "Patient",
};

describe("createPatientRegistration", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to the organization-scoped endpoint without master headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createPatientRegistration(body, "org-123")).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/organizations/org-123/patient-registrations",
      expect.objectContaining({
        body: JSON.stringify(body),
        method: "POST",
      }),
    );

    const headers = fetchMock.mock.calls[0]?.[1].headers as Headers;
    expect(headers.has("x-master-user-id")).toBe(false);
  });

  it("surfaces the API error message on conflict", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: "ConflictError", message: "Email already in use." }),
          { status: 409 },
        ),
      ),
    );

    await expect(createPatientRegistration(body, "org-123")).rejects.toThrow("Email already in use.");
  });
});
