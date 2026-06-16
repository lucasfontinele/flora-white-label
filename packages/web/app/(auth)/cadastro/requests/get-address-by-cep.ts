export type ViaCepAddress = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export async function getAddressByCep(cep: string) {
  const digits = cep.replace(/\D/g, "");

  if (digits.length !== 8) {
    throw new Error("CEP inválido.");
  }

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP.");
  }

  const data = (await response.json()) as ViaCepAddress;

  if (data.erro) {
    throw new Error("CEP não encontrado.");
  }

  return data;
}
