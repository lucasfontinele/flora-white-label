"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePatientSelection } from "@/components/associated/patient-context";
import { CatalogCard } from "@/components/domain/catalog-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { canAccessCatalog } from "@/lib/catalog-access";
import { useCatalogQuery } from "../queries/use-catalog-query";

type CatalogFilter = "todos" | "flor" | "oleo" | "cbd";

const tabs: Array<TabItem<CatalogFilter>> = [
  { value: "todos", label: "Todos" },
  { value: "flor", label: "Flor" },
  { value: "oleo", label: "Óleo" },
  { value: "cbd", label: "CBD alto" },
];

export function CatalogView() {
  // The selected patient's registration status comes from the auth context
  // (stored by usePatientSelection), so the gate is synchronous — no extra fetch.
  const { selectedPatient } = usePatientSelection();

  if (!canAccessCatalog(selectedPatient.patientStatus)) {
    return <CatalogLocked />;
  }

  return <CatalogBrowser />;
}

function CatalogBrowser() {
  const [filter, setFilter] = useState<CatalogFilter>("todos");
  const { data = [] } = useCatalogQuery();

  const items = useMemo(() => {
    if (filter === "flor") return data.filter((item) => item.category === "Flor");
    if (filter === "oleo") return data.filter((item) => item.category === "Óleo");
    if (filter === "cbd") return data.filter((item) => Number.parseFloat(item.cbd) >= 14);
    return data;
  }, [data, filter]);

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="grid gap-3 md:grid-cols-[minmax(0,420px)_auto] md:items-center">
        <Input placeholder="Buscar produto ou strain" leadingIcon={<Icon name="search" size={18} />} />
        <Tabs tabs={tabs} value={filter} onChange={setFilter} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <CatalogCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}

// Blocked state shown whenever the selected patient is not approved. It renders
// no products and no purchase entry points (search, cart, ordering).
function CatalogLocked() {
  return (
    <div className="pb-20 lg:pb-0">
      <Card className="flex flex-col items-center justify-center p-10 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-warning-subtle text-[var(--warning-600)]">
          <Icon name="lock" size={24} />
        </span>
        <h2 className="mt-4 font-heading">Catálogo indisponível</h2>
        <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
          Seu catálogo ficará disponível após a aprovação da sua receita pela associação.
        </p>
        <Button asChild className="mt-5">
          <Link href="/documents">
            <Icon name="file-text" size={18} />
            Ver documentos
          </Link>
        </Button>
      </Card>
    </div>
  );
}
