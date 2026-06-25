import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MasterDashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando relatórios da rede...</span>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-11 rounded-md" />
            </div>
            <Skeleton className="mt-6 h-9 w-28" />
            <Skeleton className="mt-4 h-4 w-32" />
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-24 rounded-pill" />
          </div>
          <div className="flex items-end gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-32 w-full rounded-t-md" />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <Skeleton className="h-5 w-24 rounded-pill" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-pill" />
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        {Array.from({ length: 2 }).map((_, cardIndex) => (
          <Card key={cardIndex} className="p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 py-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-14 rounded-pill" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
