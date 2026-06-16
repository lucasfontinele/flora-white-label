export async function getReports() {
  return [
    { title: "Pedidos por status", description: "Volume mensal e gargalos operacionais", meta: "Jun 2026", status: "Atualizado" },
    { title: "Estoque baixo", description: "Itens abaixo do mínimo definido", meta: "3 itens", status: "Ação" },
  ];
}
