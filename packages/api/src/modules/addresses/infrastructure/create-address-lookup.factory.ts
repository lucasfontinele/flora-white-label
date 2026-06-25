import { LookupAddressByZipcodeUseCase } from "../application/use-cases/LookupAddressByZipcodeUseCase.js";
import { BrasilApiAddressLookupProvider } from "./http/BrasilApiAddressLookupProvider.js";
import { FallbackAddressLookupProvider, type FallbackLogger } from "./http/FallbackAddressLookupProvider.js";
import { ViaCepAddressLookupProvider } from "./http/ViaCepAddressLookupProvider.js";

/**
 * Composition root for the zipcode lookup use case.
 *
 * Providers are tried in declaration order. To change the primary source or add
 * a new one, edit only this list — application and presentation layers are
 * unaffected.
 */
export function makeLookupAddressByZipcodeUseCase(logger?: FallbackLogger): LookupAddressByZipcodeUseCase {
  const provider = new FallbackAddressLookupProvider(
    [new ViaCepAddressLookupProvider(), new BrasilApiAddressLookupProvider()],
    logger,
  );

  return new LookupAddressByZipcodeUseCase(provider);
}
