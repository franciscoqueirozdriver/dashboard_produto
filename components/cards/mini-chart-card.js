import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MiniChartCard({ title, children, subtitle }) {
  return (
    <Card className="bg-card/60">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="text-lg font-semibold text-muted-foreground">{title}</CardTitle>
        {subtitle ? <span className="text-sm text-muted-foreground/80">{subtitle}</span> : null}
      </CardHeader>
      <CardContent className="h-40">{children}</CardContent>
    </Card>
  );
}
