"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
  count?: number;
};

type AppShellProps = {
  variant: "associated" | "organization";
  title: string;
  subtitle?: string;
  nav: NavItem[];
  user: {
    name: string;
    detail: string;
  };
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export function AppShell({ variant, title, subtitle, nav, user, children, actions }: AppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const organization = variant === "organization";

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      {menuOpen ? (
        <div className="fixed inset-0 z-40 bg-[var(--surface-overlay)] lg:hidden" onClick={() => setMenuOpen(false)}>
          <aside
            className={cn(
              "flex h-full w-[min(84vw,320px)] flex-col shadow-xl",
              organization ? "bg-petrol-700 text-white" : "bg-card",
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={cn("flex h-[72px] items-center gap-3 px-5", organization && "border-b border-white/10")}>
              <Image src="/brand/logo-mark.svg" alt="Flora" width={42} height={42} className="h-10 w-auto" />
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-bold", organization ? "text-white" : "text-[var(--text-primary)]")}>
                  Flora
                </p>
                <p className={cn("truncate text-xs", organization ? "text-white/60" : "text-[var(--text-tertiary)]")}>
                  {organization ? "Operação · Vida Verde" : "Portal do associado"}
                </p>
              </div>
              <Button size="icon" variant="ghost" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
                <Icon name="x" size={20} />
              </Button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors",
                      organization
                        ? active
                          ? "bg-white/14 text-white"
                          : "text-white/72 hover:bg-white/8 hover:text-white"
                        : active
                          ? "bg-primary-subtle text-[var(--green-700)]"
                          : "text-[var(--text-secondary)] hover:bg-muted hover:text-[var(--text-primary)]",
                    )}
                  >
                    <Icon name={item.icon} size={19} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {typeof item.count === "number" ? (
                      <span className="rounded-pill bg-accent px-2 py-0.5 text-[11px] font-extrabold text-[var(--green-900)]">
                        {item.count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}

      <aside
        className={cn(
          "hidden h-screen w-[var(--sidebar-width)] shrink-0 flex-col lg:sticky lg:top-0 lg:flex",
          organization ? "bg-petrol-700 text-white" : "border-r border-border bg-card",
        )}
      >
        <div
          className={cn(
            "flex h-[82px] items-center gap-3 px-5",
            organization && "border-b border-white/10",
          )}
        >
          <Image
            src="/brand/logo-mark.svg"
            alt="Flora"
            width={42}
            height={42}
            priority
            className="h-10 w-auto"
          />
          <div className="min-w-0">
            <p className={cn("truncate text-sm font-bold", organization ? "text-white" : "text-[var(--text-primary)]")}>
              Flora
            </p>
            <p className={cn("truncate text-xs", organization ? "text-white/60" : "text-[var(--text-tertiary)]")}>
              {organization ? "Operação · Vida Verde" : "Portal do associado"}
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors",
                  organization
                    ? active
                      ? "bg-white/14 text-white"
                      : "text-white/72 hover:bg-white/8 hover:text-white"
                    : active
                      ? "bg-primary-subtle text-[var(--green-700)]"
                      : "text-[var(--text-secondary)] hover:bg-muted hover:text-[var(--text-primary)]",
                )}
              >
                <Icon name={item.icon} size={19} />
                <span className="flex-1 truncate">{item.label}</span>
                {typeof item.count === "number" ? (
                  <span className="rounded-pill bg-accent px-2 py-0.5 text-[11px] font-extrabold text-[var(--green-900)]">
                    {item.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "flex items-center gap-3 border-t p-4",
            organization ? "border-white/10" : "border-border",
          )}
        >
          <Avatar name={user.name} inverse={organization} />
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-bold", organization && "text-white")}>
              {user.name}
            </p>
            <p className={cn("truncate text-xs", organization ? "text-white/55" : "text-[var(--text-tertiary)]")}>
              {user.detail}
            </p>
          </div>
          <Icon
            name={organization ? "log-out" : "settings"}
            size={18}
            className={organization ? "text-white/50" : "text-[var(--text-tertiary)]"}
          />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex min-h-[var(--topbar-height)] items-center gap-3 border-b border-border bg-white/88 px-4 backdrop-blur md:px-7">
          <Button
            className="lg:hidden"
            size="icon"
            variant="ghost"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" size={20} />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-snug text-[var(--text-primary)] md:text-[1.375rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="hidden truncate text-sm text-[var(--text-secondary)] md:block">{subtitle}</p>
            ) : null}
          </div>
          <div className="hidden w-[min(34vw,360px)] md:block">
            <Input
              aria-label="Buscar"
              placeholder={organization ? "Buscar pedido, associado ou produto" : "Buscar pedido ou produto"}
              leadingIcon={<Icon name="search" size={18} />}
              className="h-10"
            />
          </div>
          {actions}
          <Button size="icon" variant="ghost" aria-label="Notificações" className="relative">
            <Icon name="bell" size={21} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-error" />
          </Button>
        </header>

        <main className="mx-auto w-full max-w-content px-4 py-5 md:px-7 md:py-7">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-white/94 px-2 py-2 backdrop-blur lg:hidden">
          {nav.slice(0, 5).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-sm text-[11px] font-semibold",
                  active ? "bg-primary-subtle text-[var(--green-700)]" : "text-[var(--text-secondary)]",
                )}
              >
                <Icon name={item.icon} size={18} />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
