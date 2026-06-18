import type {
  AddressLookupProvider,
  ZipcodeAddress,
} from "../../application/providers/AddressLookupProvider.js";

interface BrasilApiCepResponse {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
}

export interface BrasilApiProviderOptions {
  baseUrl?: string;
  timeoutMs?: number;
  /** Injectable for tests; defaults to the global fetch. */
  fetchFn?: typeof fetch;
}

const DEFAULT_BASE_URL = "https://brasilapi.com.br/api/cep/v1";
const DEFAULT_TIMEOUT_MS = 4000;

/**
 * {@link AddressLookupProvider} backed by BrasilAPI (https://brasilapi.com.br).
 * Used as a fallback for ViaCEP: returns `null` on 404 (unknown CEP) and throws
 * on other transport/HTTP failures.
 */
export class BrasilApiAddressLookupProvider implements AddressLookupProvider {
  readonly name = "brasilapi";

  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: BrasilApiProviderOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async lookup(zipcode: string): Promise<ZipcodeAddress | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchFn(`${this.baseUrl}/${zipcode}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`BrasilAPI request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as BrasilApiCepResponse;

    return {
      zipcode,
      street: (data.street ?? "").trim(),
      complement: null,
      neighborhood: (data.neighborhood ?? "").trim(),
      city: (data.city ?? "").trim(),
      state: (data.state ?? "").trim().toUpperCase(),
    };
  }
}
