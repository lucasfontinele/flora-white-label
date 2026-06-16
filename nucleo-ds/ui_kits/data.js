// Núcleo — sample data for UI kits (white-label tenant: "Associação Vida Verde")
window.NUCLEO_DATA = {
  tenant: { nome: 'Associação Vida Verde', sigla: 'VV' },
  paciente: { nome: 'Maria Souza', email: 'maria.souza@email.com', associada: 'desde 2024' },

  pedidos: [
    { numero: '#PED-20482', status: 'Em separação', data: '15 jun 2026', itens: 3, tipoEntrega: 'Retirada na sede',
      timestamps: { 'Solicitado':'12 jun · 09:14', 'Em análise':'12 jun · 14:02', 'Aprovado':'13 jun · 10:30' },
      produtos: [
        { nome: 'Óleo CBD 17% — 30ml', qtd: 1 },
        { nome: 'Charlotte\u2019s Web — flor 5g', qtd: 1 },
        { nome: 'Pomada CBD 500mg', qtd: 1 },
      ] },
    { numero: '#PED-20455', status: 'Enviado', data: '08 jun 2026', itens: 2, tipoEntrega: 'Envio por correio',
      timestamps: { 'Solicitado':'05 jun · 10:00', 'Em análise':'05 jun · 15:20', 'Aprovado':'06 jun · 09:00', 'Em separação':'06 jun · 14:00', 'Pronto para retirada':'07 jun · 11:00' } },
    { numero: '#PED-20390', status: 'Entregue', data: '21 mai 2026', itens: 1, tipoEntrega: 'Retirada na sede' },
    { numero: '#PED-20301', status: 'Entregue', data: '02 mai 2026', itens: 4, tipoEntrega: 'Envio por correio' },
  ],

  tracking: {
    status: 'Enviado', ultimaAtualizacao: 'há 2 horas', previsao: '17 jun 2026', codigo: 'BR4821-9X7K',
    historico: [
      { titulo: 'Pedido enviado', quando: '15 jun · 16:40', local: 'Sede da associação' },
      { titulo: 'Pronto para retirada', quando: '15 jun · 11:10', local: 'Estoque' },
      { titulo: 'Em separação', quando: '14 jun · 09:30', local: 'Estoque' },
      { titulo: 'Pedido aprovado', quando: '13 jun · 10:30' },
      { titulo: 'Pedido solicitado', quando: '12 jun · 09:14' },
    ],
  },

  catalogo: [
    { nome: 'Charlotte\u2019s Web', tipo: 'Full spectrum', thc: '< 0,3%', cbd: '17%', terpenos: ['Mirceno','Pineno','Cariofileno'], tags: ['Ansiedade','Epilepsia'] },
    { nome: 'ACDC', tipo: 'Híbrida', thc: '6%', cbd: '14%', terpenos: ['Mirceno','Pineno'], tags: ['Dor crônica','Foco'] },
    { nome: 'Harlequin', tipo: 'Sativa', thc: '5%', cbd: '10%', terpenos: ['Mirceno','Cariofileno'], tags: ['Inflamação'] },
    { nome: 'Cannatonic', tipo: 'Híbrida', thc: '7%', cbd: '12%', terpenos: ['Limoneno','Linalol'], tags: ['Ansiedade','Sono'] },
    { nome: 'Ringo\u2019s Gift', tipo: 'Full spectrum', thc: '1%', cbd: '20%', terpenos: ['Mirceno','Terpinoleno'], tags: ['TEA','Dor'] },
    { nome: 'Stephen Hawking Kush', tipo: 'Indica', thc: '5%', cbd: '12%', terpenos: ['Linalol','Mirceno'], tags: ['Sono','Relaxamento'] },
  ],

  documentos: [
    { nome: 'Receita médica', validade: 'válida até 12 dez 2026', status: 'Aprovado' },
    { nome: 'Laudo médico (TEA)', validade: 'válido até 03 mar 2027', status: 'Aprovado' },
    { nome: 'Autorização Anvisa', validade: 'renovar até 28 jun 2026', status: 'Em análise' },
    { nome: 'Documento de identidade', validade: '—', status: 'Aprovado' },
  ],

  // Operador / Diretoria
  fila: [
    { numero: '#PED-20488', paciente: 'João Lima', status: 'Solicitado', data: '15 jun', itens: 2, entrega: 'Retirada', doc: 'OK' },
    { numero: '#PED-20487', paciente: 'Ana Reis', status: 'Em análise', data: '15 jun', itens: 1, entrega: 'Correio', doc: 'Pendente' },
    { numero: '#PED-20485', paciente: 'Carlos Nunes', status: 'Em análise', data: '14 jun', itens: 4, entrega: 'Retirada', doc: 'OK' },
    { numero: '#PED-20482', paciente: 'Maria Souza', status: 'Em separação', data: '14 jun', itens: 3, entrega: 'Retirada', doc: 'OK' },
    { numero: '#PED-20480', paciente: 'Beatriz Alves', status: 'Aprovado', data: '14 jun', itens: 2, entrega: 'Correio', doc: 'OK' },
    { numero: '#PED-20478', paciente: 'Rafael Dias', status: 'Pronto para retirada', data: '13 jun', itens: 1, entrega: 'Retirada', doc: 'OK' },
    { numero: '#PED-20455', paciente: 'Sofia Mendes', status: 'Enviado', data: '13 jun', itens: 2, entrega: 'Correio', doc: 'OK' },
    { numero: '#PED-20390', paciente: 'Pedro Castro', status: 'Entregue', data: '12 jun', itens: 1, entrega: 'Retirada', doc: 'OK' },
  ],

  metrics: [
    { label: 'Pedidos no mês', value: '142', icon: 'package', delta: '+12%', hint: 'vs. maio' },
    { label: 'Associados ativos', value: '1.284', icon: 'users', delta: '+38', hint: 'novos no mês' },
    { label: 'Aguardando análise', value: '8', icon: 'clock', delta: '−3', deltaTone: 'neutral', hint: 'hoje' },
    { label: 'Itens em estoque baixo', value: '3', icon: 'alert-triangle', delta: '+1', deltaTone: 'error', hint: 'repor' },
  ],
};
