import type { IconName } from "@/components/ui/icon";

export const associatedNav: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Início", href: "/dashboard", icon: "home" },
  { label: "Pedidos", href: "/orders", icon: "package" },
  { label: "Catálogo", href: "/catalog", icon: "book-open" },
  { label: "Documentos", href: "/documents", icon: "file-text" },
  { label: "Perfil", href: "/profile", icon: "user" },
];

export const organizationNav: Array<{
  label: string;
  href: string;
  icon: IconName;
  count?: number;
}> = [
  { label: "Visão geral", href: "/operacional/dashboard", icon: "layout-dashboard" },
  { label: "Pedidos", href: "/operacional/orders", icon: "inbox", count: 12 },
  { label: "Associados", href: "/operacional/members", icon: "users" },
  { label: "Produtos", href: "/operacional/products", icon: "package" },
  { label: "Strains", href: "/operacional/strains", icon: "flask" },
  { label: "Estoque", href: "/operacional/inventory", icon: "boxes" },
  { label: "Relatórios", href: "/operacional/reports", icon: "bar-chart-3" },
  { label: "Gestão de acessos", href: "/operacional/access", icon: "shield-check" },
];
