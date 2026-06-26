"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCentsAsCurrency } from "@/lib/money";
import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_TYPE_LABELS,
  PRODUCT_UNIT_LABELS,
  type Product,
} from "../types";

type ProductsTableProps = {
  products: Product[];
  isLoading?: boolean;
  error?: Error | null;
  pendingStatusId?: string | null;
  onEdit?: (product: Product) => void;
  onToggleStatus?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onRetry?: () => void;
};

const columnCount = 6;

export function ProductsTable({
  products,
  isLoading = false,
  error,
  pendingStatusId,
  onEdit,
  onToggleStatus,
  onDelete,
  onRetry,
}: ProductsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <ProductsTableShell>
            {Array.from({ length: 5 }).map((_, index) => (
              <ProductRowSkeleton key={index} />
            ))}
          </ProductsTableShell>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-lg text-[var(--text-primary)]">
              Não foi possível carregar os produtos
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{error.message}</p>
          </div>
          {onRetry ? (
            <Button onClick={onRetry} type="button" variant="secondary">
              Tentar novamente
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <h2 className="font-heading text-lg text-[var(--text-primary)]">
            Nenhum produto cadastrado
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Cadastre o primeiro produto do catálogo da organização.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ProductsTableShell>
          {products.map((product) => (
            <tr key={product.id} className="bg-card align-top">
              <td className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <ProductThumbnail product={product} />
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--text-primary)]">{product.name}</div>
                    {product.description ? (
                      <p className="mt-0.5 line-clamp-1 text-sm text-[var(--text-secondary)]">
                        {product.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-[var(--text-secondary)]">
                {PRODUCT_CATEGORY_LABELS[product.category]}
              </td>
              <td className="px-5 py-4">
                <Badge tone="petrol" size="sm">
                  {PRODUCT_TYPE_LABELS[product.type]}
                </Badge>
              </td>
              <td className="px-5 py-4 text-[var(--text-secondary)]">
                {PRODUCT_UNIT_LABELS[product.unit]}
              </td>
              <td className="px-5 py-4 font-medium text-[var(--text-primary)]">
                {formatCentsAsCurrency(product.priceInCents)}
              </td>
              <td className="px-5 py-4">
                <Badge dot tone={product.isActive ? "success" : "neutral"} size="sm">
                  {product.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <Button
                    aria-label={`Editar produto ${product.name}`}
                    onClick={() => onEdit?.(product)}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    Editar
                  </Button>
                  <Button
                    aria-label={`${product.isActive ? "Desativar" : "Ativar"} produto ${product.name}`}
                    disabled={pendingStatusId === product.id}
                    onClick={() => onToggleStatus?.(product)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {product.isActive ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    aria-label={`Remover produto ${product.name}`}
                    onClick={() => onDelete?.(product)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Remover
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </ProductsTableShell>
        <div className="border-t border-border px-5 py-3 text-xs text-[var(--text-secondary)]">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductThumbnail({ product }: { product: Product }) {
  if (product.coverImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.coverImageUrl}
        alt={`Capa de ${product.name}`}
        className="size-10 shrink-0 rounded-md border border-border object-cover"
      />
    );
  }

  return (
    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[var(--text-tertiary)]">
      <Icon name="image" size={18} />
    </span>
  );
}

function ProductsTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[840px] border-collapse text-left text-sm">
        <thead className="border-b border-border bg-muted text-xs uppercase text-[var(--text-secondary)]">
          <tr>
            <th className="px-5 py-3 font-semibold">Produto</th>
            <th className="px-5 py-3 font-semibold">Categoria</th>
            <th className="px-5 py-3 font-semibold">Tipo</th>
            <th className="px-5 py-3 font-semibold">Unidade</th>
            <th className="px-5 py-3 font-semibold">Preço</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 text-right font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

function ProductRowSkeleton() {
  return (
    <tr aria-busy="true" className="bg-card">
      {Array.from({ length: columnCount }).map((_, index) => (
        <td key={index} className="px-5 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </td>
    </tr>
  );
}
