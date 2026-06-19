/**
 * The API returns errors as `{ error: "ConflictError", message: "..." }`. Older
 * shapes nested everything under `error` (`{ error: { code, message } }`), so we
 * tolerate both when parsing.
 */
type ApiErrorBody = {
  error?: string | { code?: string; details?: unknown; message?: string };
  message?: string;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

/**
 * Extracts a user-facing message from a thrown error. Prefers the API's
 * `message`; falls back to a generic sentence for network/unknown failures.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Não foi possível completar a ação. Tente novamente.",
): string {
  if (error instanceof ApiRequestError && error.message) {
    return error.message;
  }

  return fallback;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const masterUserId = process.env.NEXT_PUBLIC_MASTER_USER_ID ?? "master_local";

type ApiFetchInit = RequestInit & {
  skipMasterHeaders?: boolean;
};

export async function apiFetch<T>(input: RequestInfo | URL, init?: ApiFetchInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const { skipMasterHeaders, ...requestInit } = init ?? {};

  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!skipMasterHeaders && !headers.has("x-master-user-id")) headers.set("x-master-user-id", masterUserId);
  if (!skipMasterHeaders && !headers.has("x-master-role")) headers.set("x-master-role", "master");

  const response = await fetch(resolveApiUrl(input), {
    ...requestInit,
    headers,
  });

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    const { message, code, details } = extractApiError(errorBody, response.status);
    throw new ApiRequestError(message, response.status, code, details);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

function resolveApiUrl(input: RequestInfo | URL) {
  if (typeof input !== "string") return input;
  if (/^https?:\/\//.test(input)) return input;

  return new URL(input, apiBaseUrl).toString();
}

async function readErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}

function extractApiError(
  body: ApiErrorBody,
  status: number,
): { message: string; code?: string; details?: unknown } {
  const fallback = `Falha na requisição: ${status}`;

  if (typeof body.error === "object" && body.error !== null) {
    return {
      message: body.error.message ?? body.message ?? fallback,
      code: body.error.code,
      details: body.error.details,
    };
  }

  return {
    message: body.message ?? fallback,
    code: typeof body.error === "string" ? body.error : undefined,
  };
}
