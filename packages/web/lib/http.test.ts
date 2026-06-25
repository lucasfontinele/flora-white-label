import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, apiFetch, getApiErrorMessage } from "./http";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function captureError(promise: Promise<unknown>): Promise<ApiRequestError> {
  return promise.then(
    () => {
      throw new Error("Expected the request to reject.");
    },
    (error) => error as ApiRequestError,
  );
}

describe("apiFetch error parsing", () => {
  it("uses the API's top-level message and error name (current shape)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "ConflictError",
            message: 'An organization with CNPJ "41918742000188" already exists.',
          }),
          { status: 409 },
        ),
      ),
    );

    const error = await captureError(apiFetch("/backoffice/organizations", { method: "POST" }));

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.message).toBe('An organization with CNPJ "41918742000188" already exists.');
    expect(error.status).toBe(409);
    expect(error.code).toBe("ConflictError");
  });

  it("still supports the legacy nested error shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Usuário não autorizado." } }), {
          status: 403,
        }),
      ),
    );

    const error = await captureError(apiFetch("/anything"));

    expect(error.message).toBe("Usuário não autorizado.");
    expect(error.code).toBe("FORBIDDEN");
  });

  it("falls back to a status message when the body has no message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not json", { status: 500 })));

    const error = await captureError(apiFetch("/anything"));

    expect(error.message).toBe("Falha na requisição: 500");
  });
});

describe("getApiErrorMessage", () => {
  it("returns the API message for an ApiRequestError", () => {
    const error = new ApiRequestError("CNPJ already exists.", 409, "ConflictError");

    expect(getApiErrorMessage(error)).toBe("CNPJ already exists.");
  });

  it("returns the fallback for unknown errors", () => {
    expect(getApiErrorMessage(new Error("Failed to fetch"))).toBe(
      "Não foi possível completar a ação. Tente novamente.",
    );
    expect(getApiErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
  });
});
