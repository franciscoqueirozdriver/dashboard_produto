import { cn } from '@/lib/utils';

export function Card({ className, children }) {
  return <div className={cn('rounded-xl bg-card/80 p-6 shadow-lg ring-1 ring-white/5 backdrop-blur-lg', className)}>{children}</div>;
}

export function CardHeader({ className, children }) {
  return <div className={cn('mb-6 flex items-center justify-between gap-4 text-muted-foreground', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h2 className={cn('text-2xl font-semibold text-foreground', className)}>{children}</h2>;
}

export function CardContent({ className, children }) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}
