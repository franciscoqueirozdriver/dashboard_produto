export function DashboardSkeleton() {
  return (
    <main className="space-y-12 px-12 py-10">
      <header className="flex flex-col gap-4">
        <div className="h-12 w-3/4 animate-pulse rounded-md bg-muted/50"></div>
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted/50"></div>
      </header>

      <section className="grid gap-6 xl:grid-cols-5">
        <div className="h-28 animate-pulse rounded-xl bg-muted/50"></div>
        <div className="h-28 animate-pulse rounded-xl bg-muted/50"></div>
        <div className="h-28 animate-pulse rounded-xl bg-muted/50"></div>
        <div className="h-28 animate-pulse rounded-xl bg-muted/50"></div>
        <div className="h-28 animate-pulse rounded-xl bg-muted/50"></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-muted/50"></div>
        <div className="h-80 animate-pulse rounded-xl bg-muted/50"></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="col-span-2 h-96 animate-pulse rounded-xl bg-muted/50"></div>
        <div className="h-96 animate-pulse rounded-xl bg-muted/50"></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="col-span-2 h-96 animate-pulse rounded-xl bg-muted/50"></div>
        <div className="h-96 animate-pulse rounded-xl bg-muted/50"></div>
      </section>
    </main>
  );
}
