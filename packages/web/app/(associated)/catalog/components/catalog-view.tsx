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
import {
  PRODUCT_CATEGORY_LABELS,
  type ProductCategory,
} from "@/app/organization/operacional/products/types";
import { useCatalogQuery } from "../queries/use-catalog-query";

type CatalogFilter = "todos" | ProductCategory;

export function CatalogView({ organizationId }: { organizationId: string }) {
  // The selected patient's registration status comes from the auth context
  // (stored by usePatientSelection), so the gate is synchronous — no extra fetch.
  const { selectedPatient } = usePatientSelection();

  if (!canAccessCatalog(selectedPatient.patientStatus)) {
    return <CatalogLocked />;
  }

  return <CatalogBrowser organizationId={organizationId} patientId={selectedPatient.id} />;
}

function CatalogBrowser({
  organizationId,
  patientId,
}: {
  organizationId: string;
  patientId: string;
}) {
  const [filter, setFilter] = useState<CatalogFilter>("todos");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useCatalogQuery(organizationId, patientId);

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];

  const tabs = useMemo<Array<TabItem<CatalogFilter>>>(
    () => [
      { value: "todos", label: "Todos" },
      ...categories.map((category) => ({
        value: category,
        label: PRODUCT_CATEGORY_LABELS[category],
      })),
    ],
    [categories],
  );

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      if (filter !== "todos" && product.category !== filter) return false;
      if (term && !product.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [products, filter, search]);

  if (isLoading) {
    return <Card className="p-6 text-sm text-[var(--text-secondary)]">Carregando catálogo…</Card>;
  }

  if (products.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-10 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-warning-subtle text-[var(--warning-600)]">
          <Icon name="lock" size={24} />
        </span>
        <h2 className="mt-4 font-heading">Nenhum produto liberado</h2>
        <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
          A associação ainda não liberou produtos na sua receita. Assim que a posologia for
          registrada, os produtos disponíveis aparecem aqui.
        </p>
        <Button asChild variant="ghost" className="mt-5">
          <Link href="/documents">
            <Icon name="file-text" size={18} />
            Ver documentos
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="grid gap-3 md:grid-cols-[minmax(0,420px)_auto] md:items-center">
        <Input
          placeholder="Buscar produto"
          leadingIcon={<Icon name="search" size={18} />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Tabs tabs={tabs} value={filter} onChange={setFilter} />
      </div>
      {items.length === 0 ? (
        <Card className="p-6 text-sm text-[var(--text-secondary)]">
          Nenhum produto encontrado para o filtro atual.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <CatalogCard key={item.id} item={item} />
          ))}
        </div>
      )}
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
