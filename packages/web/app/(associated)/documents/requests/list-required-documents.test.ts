import { afterEach, describe, expect, it, vi } from "vitest";
import { listRequiredDocuments } from "./list-required-documents";

const response = {
  data: [
    {
      id: "doc_1",
      organizationId: "org_1",
      name: "Comprovante de residência",
      observations: null,
      createdAt: "2026-06-22T00:00:00.000Z",
      updatedAt: "2026-06-22T00:00:00.000Z",
    },
  ],
};

describe("listRequiredDocuments (patient portal)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the org-scoped required documents without Master headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listRequiredDocuments("org_1")).resolves.toEqual(response);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("http://localhost:3333/organizations/org_1/required-documents");
    expect(init.method).toBe("GET");
    const headers = init.headers as Headers;
    expect(headers.get("x-master-user-id")).toBeNull();
  });
});
