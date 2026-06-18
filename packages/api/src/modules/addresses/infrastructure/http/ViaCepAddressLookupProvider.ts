import type {
  AddressLookupProvider,
  ZipcodeAddress,
} from "../../application/providers/AddressLookupProvider.js";

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

export interface ViaCepProviderOptions {
  baseUrl?: string;
  timeoutMs?: number;
  /** Injectable for tests; defaults to the global fetch. */
  fetchFn?: typeof fetch;
}

const DEFAULT_BASE_URL = "https://viacep.com.br/ws";
const DEFAULT_TIMEOUT_MS = 4000;

/**
 * {@link AddressLookupProvider} backed by the ViaCEP public API
 * (https://viacep.com.br). Returns `null` when ViaCEP reports an unknown CEP and
 * throws on transport/HTTP failures so a fallback can take over.
 */
export class ViaCepAddressLookupProvider implements AddressLookupProvider {
  readonly name = "viacep";

  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: ViaCepProviderOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async lookup(zipcode: string): Promise<ZipcodeAddress | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchFn(`${this.baseUrl}/${zipcode}/json/`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error(`ViaCEP request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as ViaCepResponse;

    // ViaCEP answers HTTP 200 with `{ "erro": true }` for unknown zipcodes.
    if (data.erro === true || data.erro === "true") {
      return null;
    }

    return {
      zipcode,
      street: (data.logradouro ?? "").trim(),
      complement: data.complemento && data.complemento.trim().length > 0 ? data.complemento.trim() : null,
      neighborhood: (data.bairro ?? "").trim(),
      city: (data.localidade ?? "").trim(),
      state: (data.uf ?? "").trim().toUpperCase(),
    };
  }
}
