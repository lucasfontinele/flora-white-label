import { afterEach, describe, expect, it, vi } from "vitest";
import { listRequiredDocuments } from "./list-required-documents";

const response = {
  data: [
    {
      id: "doc_1",
      organizationId: "org_1",
      name: "Receita médica",
      observations: "Trazer a via original assinada.",
      createdAt: "2026-06-22T00:00:00.000Z",
      updatedAt: "2026-06-22T00:00:00.000Z",
    },
  ],
};

describe("listRequiredDocuments", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the org-scoped list without Master headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listRequiredDocuments("org_1")).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/organizations/org_1/required-documents",
      expect.objectContaining({ method: "GET", headers: expect.any(Headers) }),
    );
    const headers = fetchMock.mock.calls[0]?.[1].headers as Headers;
    expect(headers.get("x-master-user-id")).toBeNull();
    expect(headers.get("x-master-role")).toBeNull();
  });

  it("throws the structured API message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Usuário não autorizado." } }), {
          status: 403,
        }),
      ),
    );

    await expect(listRequiredDocuments("org_1")).rejects.toThrow("Usuário não autorizado.");
  });
});
