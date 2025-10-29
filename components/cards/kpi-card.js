import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function KpiCard({ title, value, description, trend }) {
  return (
    <Card className="flex flex-col justify-between bg-gradient-to-br from-card to-card/60">
      <CardHeader>
        <CardTitle className="text-xl uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-5xl font-bold text-foreground">{value}</div>
        {description ? <p className="text-lg text-muted-foreground">{description}</p> : null}
        {trend ? <div className={cn('text-sm', trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-rose-400' : 'text-muted-foreground')}>{trend > 0 ? `▲ ${trend}%` : trend < 0 ? `▼ ${Math.abs(trend)}%` : '—'}</div> : null}
      </CardContent>
    </Card>
  );
}
