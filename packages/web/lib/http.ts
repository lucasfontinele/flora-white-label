type ApiErrorBody = {
  error?: {
    code?: string;
    details?: unknown;
    message?: string;
  };
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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const masterUserId = process.env.NEXT_PUBLIC_MASTER_USER_ID ?? "master_local";

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!headers.has("x-master-user-id")) headers.set("x-master-user-id", masterUserId);
  if (!headers.has("x-master-role")) headers.set("x-master-role", "master");

  const response = await fetch(resolveApiUrl(input), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    throw new ApiRequestError(
      errorBody.error?.message ?? `Falha na requisição: ${response.status}`,
      response.status,
      errorBody.error?.code,
      errorBody.error?.details,
    );
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
