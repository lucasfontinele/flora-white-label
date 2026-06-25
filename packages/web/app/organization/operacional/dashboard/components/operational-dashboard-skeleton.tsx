import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OperationalDashboardSkeleton() {
  return (
    <div className="space-y-5 pb-20 lg:pb-0" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando visão geral...</span>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-11 rounded-md" />
            </div>
            <Skeleton className="mt-6 h-9 w-20" />
            <Skeleton className="mt-4 h-4 w-32" />
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-24 rounded-pill" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[145px_1fr_36px] items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2.5 w-full rounded-pill" />
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 py-3">
                <Skeleton className="h-10 w-10 rounded-sm" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-12 rounded-pill" />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
