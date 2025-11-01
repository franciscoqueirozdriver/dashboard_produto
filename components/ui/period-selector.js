'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function PeriodSelector({ dateRange, setDateRange, className, onApply }) {
  const [localRange, setLocalRange] = React.useState(dateRange);

  const handleApply = () => {
    // Simulação de seleção de período: Últimos 30 dias
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);
    
    const newRange = { from: last30Days, to: today };
    setLocalRange(newRange);
    onApply(newRange);
  };

  const displayRange = localRange?.from
    ? localRange.to
      ? format(localRange.from, 'dd/MM/yyyy') + ' - ' + format(localRange.to, 'dd/MM/yyyy')
      : format(localRange.from, 'dd/MM/yyyy')
    : 'Selecione um período';

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        variant={'outline'}
        className={cn(
          'justify-start text-left font-normal gap-2',
          !localRange?.from && 'text-muted-foreground'
        )}
        onClick={handleApply}
      >
        <CalendarIcon className="h-4 w-4" />
        <span>{displayRange}</span>
      </Button>
    </div>
  );
}
