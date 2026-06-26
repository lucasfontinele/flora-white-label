import type { PatientRegistrationStatus } from "@flora/shared/authentication";
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
  relationship: string;
  initials: string;
  memberId: string;
  birthDate: string;
  condition: string;
  registrationStatus: "Ativo" | "Em análise";
  // Registration status straight from the auth context — gates catalog access.
  // Optional because legacy mock rows below predate the real session wiring.
  patientStatus?: PatientRegistrationStatus;
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

export type AssociatedDocument = {
  patientId: string;
  name: string;
  due: string;
  status: "Aprovado" | "Em análise" | "Recusado";
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
  shortName: "Paciente",
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
