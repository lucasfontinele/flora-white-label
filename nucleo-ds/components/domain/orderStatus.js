// Núcleo — order lifecycle vocabulary. Single source of truth for status order + tone.
// Never paraphrase these labels in the UI.

export const ORDER_STAGES = [
  'Solicitado',
  'Em análise',
  'Aprovado',
  'Em separação',
  'Pronto para retirada',
  'Enviado',
  'Entregue',
];

export const STATUS_TONE = {
  'Solicitado': 'neutral',
  'Em análise': 'warning',
  'Aprovado': 'primary',
  'Em separação': 'info',
  'Pronto para retirada': 'accent',
  'Enviado': 'petrol',
  'Entregue': 'success',
  'Recusado': 'error',
  'Cancelado': 'neutral',
};

export const STATUS_ICON = {
  'Solicitado': 'file-plus',
  'Em análise': 'search-check',
  'Aprovado': 'check-circle-2',
  'Em separação': 'package',
  'Pronto para retirada': 'package-check',
  'Enviado': 'truck',
  'Entregue': 'home',
  'Recusado': 'x-circle',
};

export function stageIndex(status) {
  return ORDER_STAGES.indexOf(status);
}
