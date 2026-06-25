import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteOrganization } from "./delete-organization";

describe("deleteOrganization", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a DELETE request to the backoffice endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteOrganization("org_1")).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/backoffice/organizations/org_1",
      expect.objectContaining({
        headers: expect.any(Headers),
        method: "DELETE",
      }),
    );
  });

  it("throws the structured API message when deletion fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: "Organização não encontrada." } }), {
          status: 404,
        }),
      ),
    );

    await expect(deleteOrganization("org_unknown")).rejects.toThrow("Organização não encontrada.");
  });
});
