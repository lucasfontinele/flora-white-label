import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadPatientDocument } from "./upload-patient-document";

const approval = {
  id: "ap_1",
  organizationId: "org_1",
  documentId: "doc_1",
  patientId: "pat_1",
  status: "PENDING",
  rejectedReason: null,
  fileName: "receita.pdf",
  mimeType: "application/pdf",
  size: 128,
  storageKey: "organizations/org_1/patients/pat_1/documents/ap_1/1-receita.pdf",
  fileUrl: null,
  createdAt: "2026-06-22T00:00:00.000Z",
  updatedAt: "2026-06-22T00:00:00.000Z",
};

describe("uploadPatientDocument", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts multipart FormData to the one-shot upload route without JSON or Master headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(approval), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const file = new File([new Uint8Array([1, 2, 3])], "receita.pdf", { type: "application/pdf" });
    await expect(uploadPatientDocument("org_1", "pat_1", "doc_1", file)).resolves.toEqual(approval);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      "http://localhost:3333/organizations/org_1/patients/pat_1/required-documents/doc_1/upload",
    );
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("file")).toBeInstanceOf(File);

    const headers = init.headers as Headers;
    // Browser must set the multipart boundary itself.
    expect(headers.get("content-type")).toBeNull();
    expect(headers.get("x-master-user-id")).toBeNull();
    expect(headers.get("x-master-role")).toBeNull();
  });
});
