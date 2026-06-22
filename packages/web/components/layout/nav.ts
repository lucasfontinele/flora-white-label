import type { IconName } from "@/components/ui/icon";

export const associatedNav: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Início", href: "/dashboard", icon: "home" },
  { label: "Pedidos", href: "/orders", icon: "package" },
  { label: "Catálogo", href: "/catalog", icon: "book-open" },
  { label: "Limites", href: "/limites", icon: "gauge" },
  { label: "Documentos", href: "/documents", icon: "file-text" },
  { label: "Perfil", href: "/profile", icon: "user" },
];

export const organizationNav: Array<{
  label: string;
  href: string;
  icon: IconName;
  count?: number;
}> = [
  { label: "Visão geral", href: "/organization/operacional/dashboard", icon: "layout-dashboard" },
  { label: "Pedidos", href: "/organization/operacional/orders", icon: "inbox", count: 12 },
  { label: "Aprovações", href: "/organization/operacional/approvals", icon: "clipboard-check", count: 5 },
  { label: "Associados", href: "/organization/operacional/members", icon: "users" },
  { label: "Produtos", href: "/organization/operacional/products", icon: "package" },
  { label: "Strains", href: "/organization/operacional/strains", icon: "flask" },
  { label: "Estoque", href: "/organization/operacional/inventory", icon: "boxes" },
  { label: "Relatórios", href: "/organization/operacional/reports", icon: "bar-chart-3" },
  { label: "Gestão de acessos", href: "/organization/operacional/access", icon: "shield-check" },
];

export const masterNav: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Visão geral", href: "/backoffice/painel", icon: "layout-dashboard" },
  { label: "Organizações", href: "/backoffice/organizations", icon: "store" },
  { label: "Planos", href: "/backoffice/planos", icon: "credit-card" },
];
