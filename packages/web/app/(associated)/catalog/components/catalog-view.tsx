"use client";

import { useMemo, useState } from "react";
import { CatalogCard } from "@/components/domain/catalog-card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { useCatalogQuery } from "../queries/use-catalog-query";

type CatalogFilter = "todos" | "flor" | "oleo" | "cbd";

const tabs: Array<TabItem<CatalogFilter>> = [
  { value: "todos", label: "Todos" },
  { value: "flor", label: "Flor" },
  { value: "oleo", label: "Óleo" },
  { value: "cbd", label: "CBD alto" },
];

export function CatalogView() {
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
      <div className="rounded-md border-l-4 border-info bg-info-subtle p-4 text-[var(--text-secondary)]">
        As informações são educativas e não substituem orientação médica.
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <CatalogCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}
