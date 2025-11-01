export function CardSkeleton({ className }) {
  return (
    <div className={`rounded-xl bg-card/80 p-6 shadow-lg ring-1 ring-white/5 backdrop-blur-lg ${className}`}>
      <div className="mb-6 h-8 w-1/2 animate-pulse rounded-md bg-muted/50"></div>
      <div className="h-[400px] animate-pulse rounded-md bg-muted/50"></div>
    </div>
  );
}
