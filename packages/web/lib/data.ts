import type { BadgeProps } from "@/components/ui/badge";
import type { IconName } from "@/components/ui/icon";

export const orderStages = [
  "Solicitado",
  "Em análise",
  "Aprovado",
  "Em separação",
  "Pronto para retirada",
  "Enviado",
  "Entregue",
] as const;

export type OrderStatus = (typeof orderStages)[number];

export type ProductLine = {
  name: string;
  quantity: number;
  unit?: string;
  stockTone?: "success" | "warning" | "error";
};

export type AssociatedOrder = {
  id: string;
  patientId: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  items: number;
  deliveryType: "Retirada na sede" | "Envio por correio";
  timestamps?: Partial<Record<OrderStatus, string>>;
  products?: ProductLine[];
};

export type PatientKind = "humano" | "pet";

export type PatientProfile = {
  id: string;
  name: string;
  relationship: "Paciente" | "Filho" | "Mãe" | "Pai" | "Titular" | "Pet";
  initials: string;
  memberId: string;
  birthDate: string;
  condition: string;
  registrationStatus: "Ativo" | "Em análise";
  prescriptionDue: string;
  anvisaDue: string;
  nextReview: string;
  kind?: PatientKind;
  species?: string;
};

// Responsável (associado) logado. Carrega também os campos da carteirinha e
// `isPatient` (persona "responsável por ele mesmo" — o associado é o paciente).
export type ResponsibleProfile = {
  name: string;
  email: string;
  phone: string;
  since: string;
  activePatientId: string;
  isPatient: boolean;
  memberId: string;
  memberSince: string;
  memberType: string;
  membershipStatus: string;
  document: string;
  validThrough: string;
};

// Cenário de demonstração: combina um responsável e seus pacientes para
// pré-visualizar as variações da home (mock; selecionável no topo da tela).
export type AssociatedScenario = {
  id: string;
  label: string;
  responsible: ResponsibleProfile;
  patients: PatientProfile[];
};

export type AssociatedDocument = {
  patientId: string;
  name: string;
  due: string;
  status: "Aprovado" | "Em análise" | "Recusado";
};

// Forma farmacêutica do produto — define o ícone e a unidade de consumo.
export type ProductForm = "Óleo" | "Flor" | "Goma" | "Pomada" | "Concentrado";

// Unidade em que o limite é medido. Frascos/gomas/pomadas/concentrados são
// contados por quantidade; flores in natura são medidas em gramas ("g").
export type ConsumptionUnit = "frasco" | "g" | "unidade" | "embalagem";

// Janela em que o limite se renova. Receitas digitais (MEMED) trazem limites
// por mês ("02 frascos/mês") ou por ano ("12 embalagens/ano").
export type LimitPeriod = "mensal" | "anual";

// Limite de compra liberado por receita para um paciente, no período vigente.
// `allowed` é o teto do período; `used` é o que já foi adquirido nele.
// `organizationId` amarra o limite à associação: o portal é white-label (uma
// associação por contexto), então a receita só vale na organização que a importou.
export type PurchaseLimit = {
  id: string;
  organizationId: string;
  patientId: string;
  product: string;
  brand: string;
  form: ProductForm;
  unit: ConsumptionUnit;
  period: LimitPeriod;
  allowed: number;
  used: number;
  prescriptionDue: string;
  posology: string;
};

export type OperatorOrder = {
  id: string;
  number: string;
  patient: string;
  responsible: string;
  status: OrderStatus;
  createdAt: string;
  items: number;
  deliveryType: "Retirada" | "Correio";
  documentStatus: "OK" | "Pendente";
  products: ProductLine[];
};

export const tenant = {
  id: "org-vida-verde",
  name: "Associação Vida Verde",
  shortName: "Vida Verde",
  portal: "Portal do associado",
};

export const associatedUser: ResponsibleProfile = {
  name: "Camila Duarte",
  activePatientId: "joao-silva",
  email: "camila.duarte@email.com",
  phone: "(11) 98876-5432",
  since: "desde 2024",
  isPatient: false,
  // --- Carteirinha digital / comprovante de filiação (mock de protótipo) ---
  // TODO(api): preencher a partir de AuthenticatedUserProfileDto + dados de
  // filiação do associado (número, data de adesão, situação, validade).
  memberId: "4624",
  memberSince: "12/06/2024",
  memberType: "Responsável",
  membershipStatus: "Ativado",
  document: "***.456.789-**",
  validThrough: "12/2026",
};

export const associatedPatients: PatientProfile[] = [
  {
    id: "joao-silva",
    name: "João Silva",
    relationship: "Filho",
    initials: "JS",
    memberId: "4625",
    birthDate: "14 ago 2016",
    condition: "TEA",
    registrationStatus: "Ativo",
    prescriptionDue: "12 dez 2026",
    anvisaDue: "28 jun 2026",
    nextReview: "15 jul 2026",
  },
  {
    id: "marina-duarte",
    name: "Marina Duarte",
    relationship: "Mãe",
    initials: "MD",
    memberId: "4626",
    birthDate: "02 fev 1958",
    condition: "Dor crônica",
    registrationStatus: "Ativo",
    prescriptionDue: "08 nov 2026",
    anvisaDue: "18 ago 2026",
    nextReview: "22 jul 2026",
  },
  {
    id: "antonio-duarte",
    name: "Antônio Duarte",
    relationship: "Pai",
    initials: "AD",
    memberId: "4627",
    birthDate: "19 set 1954",
    condition: "Sono",
    registrationStatus: "Em análise",
    prescriptionDue: "pendente de aprovação",
    anvisaDue: "renovar cadastro",
    nextReview: "aguardando documento",
  },
];

// Reaproveita os dados ricos (pedidos, limites, documentos já existem por id) de
// um paciente base e sobrescreve só o que muda na persona — assim cada cenário
// mostra uma home populada.
function scenarioPatient(baseId: string, overrides: Partial<PatientProfile>): PatientProfile {
  const base = associatedPatients.find((patient) => patient.id === baseId) ?? associatedPatients[0];
  return { ...base, ...overrides };
}

// Cenários de demonstração para pré-visualizar as variações da home (mock).
// Selecionável no seletor do topo. O "Padrão" mantém o comportamento atual.
export const associatedScenarios: AssociatedScenario[] = [
  {
    id: "padrao",
    label: "Padrão · responsável por 3",
    responsible: associatedUser,
    patients: associatedPatients,
  },
  {
    id: "self",
    label: "Responsável por ele mesmo",
    responsible: {
      name: "Lucas Fontinele",
      email: "lucas.fontinele@email.com",
      phone: "(71) 99654-1240",
      since: "desde 2025",
      activePatientId: "joao-silva",
      isPatient: true,
      memberId: "4624",
      memberSince: "11/06/2025",
      memberType: "Titular",
      membershipStatus: "Ativado",
      document: "069.***.***-40",
      validThrough: "06/2027",
    },
    patients: [
      scenarioPatient("joao-silva", {
        name: "Lucas Fontinele",
        relationship: "Titular",
        initials: "LF",
        kind: "humano",
        condition: "Dor crônica e ansiedade",
        birthDate: "23 mar 1994",
        memberId: "4624",
      }),
    ],
  },
  {
    id: "two-people",
    label: "Responsável por duas pessoas",
    responsible: { ...associatedUser, activePatientId: "joao-silva" },
    patients: [
      scenarioPatient("joao-silva", { name: "João Silva", relationship: "Filho", kind: "humano" }),
      scenarioPatient("marina-duarte", { name: "Marina Duarte", relationship: "Mãe", kind: "humano" }),
    ],
  },
  {
    id: "person-pet",
    label: "Responsável por uma pessoa e um pet",
    responsible: {
      name: "Renata Lopes",
      email: "renata.lopes@email.com",
      phone: "(71) 99812-3300",
      since: "desde 2024",
      activePatientId: "joao-silva",
      isPatient: false,
      memberId: "5180",
      memberSince: "02/02/2024",
      memberType: "Responsável",
      membershipStatus: "Ativado",
      document: "***.412.880-**",
      validThrough: "02/2027",
    },
    patients: [
      scenarioPatient("joao-silva", { name: "Pedro Lopes", relationship: "Filho", initials: "PL", kind: "humano", condition: "TEA" }),
      scenarioPatient("marina-duarte", {
        name: "Thor",
        relationship: "Pet",
        initials: "TH",
        kind: "pet",
        species: "Canina · Golden Retriever",
        condition: "Epilepsia",
        birthDate: "10 jan 2019",
      }),
    ],
  },
  {
    id: "only-pet",
    label: "Associado com um pet",
    responsible: {
      name: "Bruno Antunes",
      email: "bruno.antunes@email.com",
      phone: "(71) 99500-7788",
      since: "desde 2026",
      activePatientId: "joao-silva",
      isPatient: false,
      memberId: "5402",
      memberSince: "20/05/2026",
      memberType: "Tutor",
      membershipStatus: "Ativado",
      document: "***.778.001-**",
      validThrough: "05/2028",
    },
    patients: [
      scenarioPatient("joao-silva", {
        name: "Mel",
        relationship: "Pet",
        initials: "ME",
        kind: "pet",
        species: "Felina · SRD",
        condition: "Dor crônica",
        birthDate: "05 set 2020",
      }),
    ],
  },
];

export const associatedOrders: AssociatedOrder[] = [
  {
    id: "PED-20482",
    patientId: "joao-silva",
    number: "#PED-20482",
    status: "Em separação",
    createdAt: "12 jun 2026",
    items: 3,
    deliveryType: "Retirada na sede",
    timestamps: {
      Solicitado: "12 jun · 09:14",
      "Em análise": "12 jun · 14:02",
      Aprovado: "13 jun · 10:30",
      "Em separação": "hoje · 09:30",
    },
    products: [
      { name: "Óleo CBD 17% - 30ml", quantity: 1 },
      { name: "Charlotte's Web - flor 5g", quantity: 1 },
      { name: "Pomada CBD 500mg", quantity: 1 },
    ],
  },
  {
    id: "PED-20455",
    patientId: "joao-silva",
    number: "#PED-20455",
    status: "Enviado",
    createdAt: "08 jun 2026",
    items: 2,
    deliveryType: "Envio por correio",
    timestamps: {
      Solicitado: "05 jun · 10:00",
      "Em análise": "05 jun · 15:20",
      Aprovado: "06 jun · 09:00",
      "Em separação": "06 jun · 14:00",
      "Pronto para retirada": "07 jun · 11:00",
      Enviado: "08 jun · 16:40",
    },
  },
  {
    id: "PED-20390",
    patientId: "joao-silva",
    number: "#PED-20390",
    status: "Entregue",
    createdAt: "21 mai 2026",
    items: 1,
    deliveryType: "Retirada na sede",
  },
  {
    id: "PED-20301",
    patientId: "joao-silva",
    number: "#PED-20301",
    status: "Entregue",
    createdAt: "02 mai 2026",
    items: 4,
    deliveryType: "Envio por correio",
  },
  {
    id: "PED-20441",
    patientId: "marina-duarte",
    number: "#PED-20441",
    status: "Aprovado",
    createdAt: "06 jun 2026",
    items: 2,
    deliveryType: "Envio por correio",
    timestamps: {
      Solicitado: "06 jun · 08:12",
      "Em análise": "06 jun · 12:18",
      Aprovado: "07 jun · 09:44",
    },
    products: [
      { name: "Óleo CBD 17% - 30ml", quantity: 1 },
      { name: "Pomada CBD 500mg", quantity: 1 },
    ],
  },
  {
    id: "PED-20376",
    patientId: "marina-duarte",
    number: "#PED-20376",
    status: "Entregue",
    createdAt: "18 mai 2026",
    items: 1,
    deliveryType: "Retirada na sede",
  },
  {
    id: "PED-20412",
    patientId: "antonio-duarte",
    number: "#PED-20412",
    status: "Em análise",
    createdAt: "01 jun 2026",
    items: 1,
    deliveryType: "Retirada na sede",
    timestamps: {
      Solicitado: "01 jun · 10:05",
      "Em análise": "01 jun · 15:20",
    },
    products: [{ name: "Cannatonic - óleo 30ml", quantity: 1 }],
  },
];

export const tracking = {
  status: "Enviado" as OrderStatus,
  updatedAt: "há 2 horas",
  forecast: "17 jun 2026",
  code: "BR4821-9X7K",
  address: "Associação Vida Verde - Unidade Centro",
  history: [
    { title: "Pedido enviado", date: "15 jun · 16:40", location: "Sede da associação" },
    { title: "Pronto para retirada", date: "15 jun · 11:10", location: "Estoque" },
    { title: "Em separação", date: "14 jun · 09:30", location: "Estoque" },
    { title: "Pedido aprovado", date: "13 jun · 10:30" },
    { title: "Pedido solicitado", date: "12 jun · 09:14" },
  ],
};

export const catalog = [
  {
    name: "Charlotte's Web",
    category: "Flor",
    type: "Full spectrum",
    thc: "< 0,3%",
    cbd: "17%",
    terpenes: ["Mirceno", "Pineno", "Cariofileno"],
    tags: ["Ansiedade", "Epilepsia"],
  },
  {
    name: "ACDC",
    category: "Flor",
    type: "Híbrida",
    thc: "6%",
    cbd: "14%",
    terpenes: ["Mirceno", "Pineno"],
    tags: ["Dor crônica", "Foco"],
  },
  {
    name: "Harlequin",
    category: "Flor",
    type: "Sativa",
    thc: "5%",
    cbd: "10%",
    terpenes: ["Mirceno", "Cariofileno"],
    tags: ["Inflamação"],
  },
  {
    name: "Cannatonic",
    category: "Óleo",
    type: "Híbrida",
    thc: "7%",
    cbd: "12%",
    terpenes: ["Limoneno", "Linalol"],
    tags: ["Ansiedade", "Sono"],
  },
  {
    name: "Ringo's Gift",
    category: "Óleo",
    type: "Full spectrum",
    thc: "1%",
    cbd: "20%",
    terpenes: ["Mirceno", "Terpinoleno"],
    tags: ["TEA", "Dor"],
  },
  {
    name: "Stephen Hawking Kush",
    category: "Flor",
    type: "Indica",
    thc: "5%",
    cbd: "12%",
    terpenes: ["Linalol", "Mirceno"],
    tags: ["Sono", "Relaxamento"],
  },
];

export const associatedDocuments: AssociatedDocument[] = [
  { patientId: "joao-silva", name: "Receita médica", due: "válida até 12 dez 2026", status: "Aprovado" },
  { patientId: "joao-silva", name: "Laudo médico (TEA)", due: "válido até 03 mar 2027", status: "Aprovado" },
  { patientId: "joao-silva", name: "Autorização Anvisa", due: "renovar até 28 jun 2026", status: "Em análise" },
  { patientId: "joao-silva", name: "Documento de identidade", due: "sem vencimento", status: "Aprovado" },
  { patientId: "marina-duarte", name: "Receita médica", due: "válida até 08 nov 2026", status: "Aprovado" },
  { patientId: "marina-duarte", name: "Laudo médico", due: "válido até 19 jan 2027", status: "Aprovado" },
  { patientId: "marina-duarte", name: "Autorização Anvisa", due: "renovar até 18 ago 2026", status: "Aprovado" },
  { patientId: "antonio-duarte", name: "Receita médica", due: "enviada para análise", status: "Em análise" },
  { patientId: "antonio-duarte", name: "Laudo médico", due: "pendente de envio", status: "Recusado" },
  { patientId: "antonio-duarte", name: "Documento de identidade", due: "sem vencimento", status: "Aprovado" },
];

// Limites de compra liberados por receita (mock de protótipo). Os valores foram
// extraídos de receitas digitais reais (MEMED) — limites por mês ("frascos/mês")
// e por ano ("embalagens/ano"). Flores são medidas em gramas (g): cada embalagem
// de 10 g vira 120 g/ano. Antônio (cadastro em análise) não tem limites liberados.
// TODO(api): derivar de uma receita validada + histórico de pedidos do paciente.
// Todos pertencem à associação atual (white-label) — `organizationId` é injetado
// a partir de `tenant.id` no map abaixo.
const rawPurchaseLimits: Omit<PurchaseLimit, "organizationId">[] = [
  {
    id: "lim-js-01",
    patientId: "joao-silva",
    product: "Óleo Fullspectrum CBD 6% (1800mg/30ml)",
    brand: "Acaflor",
    form: "Óleo",
    unit: "frasco",
    period: "mensal",
    allowed: 2,
    used: 1,
    prescriptionDue: "12 dez 2026",
    posology: "6 gotas sublingual 2x ao dia",
  },
  {
    id: "lim-js-02",
    patientId: "joao-silva",
    product: "Óleo misto THC/CBD 1:1 6% (1800mg/30ml)",
    brand: "Acaflor",
    form: "Óleo",
    unit: "frasco",
    period: "mensal",
    allowed: 2,
    used: 2,
    prescriptionDue: "12 dez 2026",
    posology: "5 gotas sublingual 2x ao dia",
  },
  {
    id: "lim-js-03",
    patientId: "joao-silva",
    product: "Pomada rica em THC 2% (15g)",
    brand: "Aliança Medicinal",
    form: "Pomada",
    unit: "unidade",
    period: "mensal",
    allowed: 3,
    used: 1,
    prescriptionDue: "12 dez 2026",
    posology: "Aplicar 1 a 3x ao dia",
  },
  {
    id: "lim-js-04",
    patientId: "joao-silva",
    product: "Concentrado sem solvente THC 50% (1g)",
    brand: "Abecmed",
    form: "Concentrado",
    unit: "unidade",
    period: "mensal",
    allowed: 5,
    used: 4,
    prescriptionDue: "12 dez 2026",
    posology: "Vaporizar 0,1 a 0,2g por sessão",
  },
  {
    id: "lim-js-05",
    patientId: "joao-silva",
    product: "Flores in natura ricas em CBD",
    brand: "Acaflor",
    form: "Flor",
    unit: "g",
    period: "anual",
    allowed: 120,
    used: 35,
    prescriptionDue: "12 dez 2026",
    posology: "Vaporizar 0,2 a 0,3g de 1 a 3x ao dia",
  },
  {
    id: "lim-js-06",
    patientId: "joao-silva",
    product: "Flores in natura equilibradas CBD/THC",
    brand: "Acaflor",
    form: "Flor",
    unit: "g",
    period: "anual",
    allowed: 120,
    used: 104,
    prescriptionDue: "12 dez 2026",
    posology: "Vaporizar 0,2 a 0,3g de 1 a 3x ao dia",
  },
  {
    id: "lim-js-07",
    patientId: "joao-silva",
    product: "Gomas CBN 180mg (30un)",
    brand: "FlowerMed",
    form: "Goma",
    unit: "embalagem",
    period: "anual",
    allowed: 12,
    used: 5,
    prescriptionDue: "12 dez 2026",
    posology: "Mastigar 1 unidade à noite",
  },
  {
    id: "lim-js-08",
    patientId: "joao-silva",
    product: "Óleo Full Spectrum 3.000mg (30ml)",
    brand: "FlowerMed",
    form: "Óleo",
    unit: "frasco",
    period: "anual",
    allowed: 12,
    used: 3,
    prescriptionDue: "12 dez 2026",
    posology: "6 gotas sublingual 2x ao dia",
  },
  {
    id: "lim-md-01",
    patientId: "marina-duarte",
    product: "Óleo Fullspectrum CBD/THC 1:1 6% (30ml)",
    brand: "Aliança Medicinal",
    form: "Óleo",
    unit: "frasco",
    period: "mensal",
    allowed: 2,
    used: 0,
    prescriptionDue: "08 nov 2026",
    posology: "5 gotas sublingual 2x ao dia",
  },
  {
    id: "lim-md-02",
    patientId: "marina-duarte",
    product: "Pomada rica em THC 2% (15g)",
    brand: "Aliança Medicinal",
    form: "Pomada",
    unit: "unidade",
    period: "mensal",
    allowed: 3,
    used: 2,
    prescriptionDue: "08 nov 2026",
    posology: "Aplicar 1 a 3x ao dia",
  },
  {
    id: "lim-md-03",
    patientId: "marina-duarte",
    product: "Flores in natura ricas em THC",
    brand: "Abecmed",
    form: "Flor",
    unit: "g",
    period: "anual",
    allowed: 180,
    used: 150,
    prescriptionDue: "08 nov 2026",
    posology: "Vaporizar 0,1 a 0,2g por sessão",
  },
];

export const purchaseLimits: PurchaseLimit[] = rawPurchaseLimits.map((limit) => ({
  ...limit,
  organizationId: tenant.id,
}));

export const operatorOrders: OperatorOrder[] = [
  {
    id: "PED-20488",
    number: "#PED-20488",
    patient: "João Lima",
    responsible: "Camila Duarte · tutor",
    status: "Solicitado",
    createdAt: "15 jun",
    items: 2,
    deliveryType: "Retirada",
    documentStatus: "OK",
    products: [
      { name: "Óleo CBD 17% - 30ml", quantity: 1, stockTone: "error" },
      { name: "Pomada CBD 500mg", quantity: 1, stockTone: "warning" },
    ],
  },
  {
    id: "PED-20487",
    number: "#PED-20487",
    patient: "Ana Reis",
    responsible: "Titular",
    status: "Em análise",
    createdAt: "15 jun",
    items: 1,
    deliveryType: "Correio",
    documentStatus: "Pendente",
    products: [{ name: "Óleo CBD 17% - 30ml", quantity: 1, stockTone: "warning" }],
  },
  {
    id: "PED-20485",
    number: "#PED-20485",
    patient: "Carlos Nunes",
    responsible: "Titular",
    status: "Em análise",
    createdAt: "14 jun",
    items: 4,
    deliveryType: "Retirada",
    documentStatus: "OK",
    products: [
      { name: "ACDC - flor 5g", quantity: 1 },
      { name: "Óleo CBD 17% - 30ml", quantity: 2 },
      { name: "Pomada CBD 500mg", quantity: 1 },
    ],
  },
  {
    id: "PED-20482",
    number: "#PED-20482",
    patient: "João Silva",
    responsible: "Camila Duarte · tutor",
    status: "Em separação",
    createdAt: "14 jun",
    items: 3,
    deliveryType: "Retirada",
    documentStatus: "OK",
    products: [
      { name: "Óleo CBD 17% - 30ml", quantity: 1, stockTone: "error" },
      { name: "Charlotte's Web - flor 5g", quantity: 1, stockTone: "warning" },
      { name: "Pomada CBD 500mg", quantity: 1, stockTone: "success" },
    ],
  },
  {
    id: "PED-20480",
    number: "#PED-20480",
    patient: "Beatriz Alves",
    responsible: "Titular",
    status: "Aprovado",
    createdAt: "14 jun",
    items: 2,
    deliveryType: "Correio",
    documentStatus: "OK",
    products: [{ name: "Cannatonic - óleo 30ml", quantity: 2 }],
  },
  {
    id: "PED-20478",
    number: "#PED-20478",
    patient: "Rafael Dias",
    responsible: "Titular",
    status: "Pronto para retirada",
    createdAt: "13 jun",
    items: 1,
    deliveryType: "Retirada",
    documentStatus: "OK",
    products: [{ name: "Harlequin - flor 5g", quantity: 1 }],
  },
  {
    id: "PED-20455",
    number: "#PED-20455",
    patient: "Sofia Mendes",
    responsible: "Titular",
    status: "Enviado",
    createdAt: "13 jun",
    items: 2,
    deliveryType: "Correio",
    documentStatus: "OK",
    products: [{ name: "Óleo CBD 17% - 30ml", quantity: 2 }],
  },
  {
    id: "PED-20390",
    number: "#PED-20390",
    patient: "Pedro Castro",
    responsible: "Titular",
    status: "Entregue",
    createdAt: "12 jun",
    items: 1,
    deliveryType: "Retirada",
    documentStatus: "OK",
    products: [{ name: "Pomada CBD 500mg", quantity: 1 }],
  },
];

export const metrics = [
  { label: "Pedidos pendentes", value: "12", icon: "inbox", delta: "+4", hint: "aguardando ação" },
  { label: "Em separação", value: "9", icon: "package-open", delta: "0", hint: "hoje" },
  { label: "Enviados", value: "14", icon: "truck", delta: "+6", hint: "esta semana", tone: "success" },
  { label: "Associados ativos", value: "1.284", icon: "users", delta: "+38", hint: "no mês", tone: "success" },
  { label: "Estoque baixo", value: "3", icon: "alert-triangle", delta: "+1", hint: "repor", tone: "error" },
  { label: "Documentos p/ análise", value: "7", icon: "file-check", delta: "-2", hint: "fila" },
] satisfies Array<{
  label: string;
  value: string;
  icon: IconName;
  delta: string;
  hint: string;
  tone?: "success" | "error";
}>;

export const lowStock = [
  { name: "Óleo CBD 17% - 30ml", amount: "4 un.", tone: "error" },
  { name: "Pomada CBD 500mg", amount: "9 un.", tone: "warning" },
  { name: "Charlotte's Web - flor", amount: "12 g", tone: "warning" },
] satisfies Array<{ name: string; amount: string; tone: BadgeProps["tone"] }>;

export const rolePermissions = [
  {
    name: "Operador",
    description: "Atendimento e fila de pedidos",
    members: 3,
    icon: "user" as IconName,
    selected: true,
  },
  {
    name: "Analista",
    description: "Análise de documentos e aprovações",
    members: 2,
    icon: "clipboard-check" as IconName,
  },
  {
    name: "Administrador",
    description: "Catálogo, estoque e configurações",
    members: 2,
    icon: "sliders" as IconName,
  },
  {
    name: "Diretoria",
    description: "Indicadores e relatórios",
    members: 2,
    icon: "bar-chart-3" as IconName,
  },
];

export const permissionMatrix = [
  { module: "Pedidos", view: true, create: true, edit: true, approve: true },
  { module: "Associados", view: true, create: true, edit: true, approve: false },
  { module: "Catálogo e produtos", view: true, create: false, edit: false, approve: false },
  { module: "Estoque", view: true, create: false, edit: true, approve: false },
  { module: "Documentos", view: true, create: false, edit: true, approve: true },
  { module: "Relatórios", view: false, create: false, edit: false, approve: false },
  { module: "Gestão de acessos", view: false, create: false, edit: false, approve: false },
];

export const statusTone: Record<OrderStatus, BadgeProps["tone"]> = {
  Solicitado: "neutral",
  "Em análise": "warning",
  Aprovado: "primary",
  "Em separação": "info",
  "Pronto para retirada": "accent",
  Enviado: "petrol",
  Entregue: "success",
};

export function stageIndex(status: OrderStatus) {
  return orderStages.indexOf(status);
}

export function getOperatorOrder(id: string) {
  return operatorOrders.find((order) => order.id === id);
}
