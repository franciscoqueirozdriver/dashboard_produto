'use client';

import * as React from 'react';
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const normalizeDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const normalizeRange = (range) => {
  if (!range) return undefined;
  const from = normalizeDate(range.from);
  const to = normalizeDate(range.to);

  if (from && to && from > to) {
    return { from: to, to: from };
  }

  if (!from && !to) {
    return undefined;
  }

  return { from: from ?? undefined, to: to ?? undefined };
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return a.getTime() === b.getTime();
};

const createPresetRange = (factory) => () => normalizeRange(factory());

const PRESETS = [
  {
    key: 'today',
    label: 'Hoje',
    getRange: createPresetRange(() => {
      const today = normalizeDate(new Date());
      return { from: today, to: today };
    }),
  },
  {
    key: 'last7',
    label: 'Últimos 7 dias',
    getRange: createPresetRange(() => {
      const today = normalizeDate(new Date());
      return { from: subDays(today, 6), to: today };
    }),
  },
  {
    key: 'currentWeek',
    label: 'Semana Atual',
    getRange: createPresetRange(() => {
      const today = new Date();
      const from = normalizeDate(startOfWeek(today, { weekStartsOn: 1 }));
      const to = normalizeDate(endOfWeek(today, { weekStartsOn: 1 }));
      return { from, to };
    }),
  },
  {
    key: 'last30',
    label: 'Últimos 30 dias',
    getRange: createPresetRange(() => {
      const today = normalizeDate(new Date());
      return { from: subDays(today, 29), to: today };
    }),
  },
  {
    key: 'lastMonth',
    label: 'Mês Passado',
    getRange: createPresetRange(() => {
      const today = new Date();
      const lastMonth = subMonths(today, 1);
      const from = normalizeDate(startOfMonth(lastMonth));
      const to = normalizeDate(endOfMonth(lastMonth));
      return { from, to };
    }),
  },
  {
    key: 'currentMonth',
    label: 'Mês Atual',
    getRange: createPresetRange(() => {
      const today = normalizeDate(new Date());
      const from = normalizeDate(startOfMonth(today));
      return { from, to: today };
    }),
  },
  {
    key: 'currentYear',
    label: 'Ano Atual',
    getRange: createPresetRange(() => {
      const today = normalizeDate(new Date());
      const from = normalizeDate(startOfYear(today));
      return { from, to: today };
    }),
  },
];

const findMatchingPreset = (range) => {
  if (!range?.from || !range?.to) return undefined;

  return PRESETS.find((preset) => {
    const presetRange = preset.getRange();
    return (
      presetRange?.from &&
      presetRange?.to &&
      isSameDay(presetRange.from, normalizeDate(range.from)) &&
      isSameDay(presetRange.to, normalizeDate(range.to))
    );
  });
};

export function PeriodSelector({ dateRange, setDateRange, className, onApply }) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const normalizedSelection = React.useMemo(
    () => normalizeRange(dateRange),
    [dateRange]
  );

  const activePreset = React.useMemo(
    () => findMatchingPreset(normalizedSelection),
    [normalizedSelection]
  );

  const displayRange = React.useMemo(() => {
    if (activePreset) {
      return activePreset.label;
    }

    if (normalizedSelection?.from && normalizedSelection?.to) {
      return (
        format(normalizedSelection.from, 'dd/MM/yyyy') +
        ' – ' +
        format(normalizedSelection.to, 'dd/MM/yyyy')
      );
    }

    if (normalizedSelection?.from) {
      return format(normalizedSelection.from, 'dd/MM/yyyy');
    }

    return 'Selecione um período';
  }, [activePreset, normalizedSelection]);

  const handlePresetSelect = (preset) => {
    const range = preset.getRange();
    setDateRange(range);
    onApply(range);
    setIsDropdownOpen(false);
  };

  const handleRangeSelect = (range) => {
    const normalized = normalizeRange(range);
    setDateRange(normalized);

    if (normalized?.from && normalized?.to) {
      onApply(normalized);
      setIsDropdownOpen(false);
    }
  };

  const handleApply = () => {
    const normalized = normalizeRange(dateRange);
    if (normalized?.from && normalized?.to) {
      setDateRange(normalized);
      onApply(normalized);
      setIsDropdownOpen(false);
    }
  };

  const defaultMonth = normalizedSelection?.from ?? new Date();
  const canApply = Boolean(normalizedSelection?.from && normalizedSelection?.to);

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-10 min-w-[14rem] justify-start gap-2 rounded-xl border-[#243347] bg-[#0e1623] text-left text-sm font-normal text-[#e2e8f0]',
            !normalizedSelection?.from && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          <span>{displayRange}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={12}
        className="w-[560px] max-w-[90vw] rounded-2xl border border-[#243347] bg-[#0f1624] p-4 text-[#e2e8f0] shadow-xl"
      >
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {PRESETS.map((preset) => (
            <PresetChip
              key={preset.key}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              data-active={preset.key === activePreset?.key}
              aria-pressed={preset.key === activePreset?.key}
            >
              {preset.label}
            </PresetChip>
          ))}
        </div>

        <div className="rounded-2xl border border-[#243347] bg-[#0e1623] p-3">
          <DayPicker
            mode="range"
            captionLayout="dropdown"
            selected={normalizedSelection}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            weekStartsOn={1}
            locale={ptBR}
            showOutsideDays
            fixedWeeks
            defaultMonth={defaultMonth}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={!canApply}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#04130e] hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aplicar
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PresetChip({ className, ...props }) {
  return (
    <button
      {...props}
      className={cn(
        'rounded-full border border-emerald-900/40 bg-[#0b1f1a] px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-[#0f2b22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-0 data-[active=true]:border-emerald-400 data-[active=true]:bg-emerald-500 data-[active=true]:text-[#04130e]',
        className
      )}
    />
  );
}
