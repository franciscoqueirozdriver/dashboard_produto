'use client';

import * as React from 'react';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PRESETS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Últimos 7 dias', value: 'last7' },
  { label: 'Semana Atual', value: 'currentWeek' },
  { label: 'Últimos 30 dias', value: 'last30' },
  { label: 'Mês Passado', value: 'lastMonth' },
  { label: 'Mês Atual', value: 'currentMonth' },
  { label: 'Ano Atual', value: 'currentYear' },
];

const getPresetRange = (value) => {
  const today = new Date();
  const normalizedToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  switch (value) {
    case 'today':
      return {
        from: normalizedToday,
        to: endOfToday,
      };
    case 'last7': {
      const from = startOfDay(subDays(normalizedToday, 6));
      return { from, to: endOfToday };
    }
    case 'currentWeek': {
      const from = startOfWeek(normalizedToday, { weekStartsOn: 1 });
      const to = endOfWeek(normalizedToday, { weekStartsOn: 1 });
      return { from, to };
    }
    case 'last30': {
      const from = startOfDay(subDays(normalizedToday, 29));
      return { from, to: endOfToday };
    }
    case 'lastMonth': {
      const previousMonth = subMonths(normalizedToday, 1);
      return {
        from: startOfMonth(previousMonth),
        to: endOfMonth(previousMonth),
      };
    }
    case 'currentMonth': {
      return {
        from: startOfMonth(normalizedToday),
        to: endOfMonth(normalizedToday),
      };
    }
    case 'currentYear': {
      return {
        from: startOfYear(normalizedToday),
        to: endOfYear(normalizedToday),
      };
    }
    default:
      return { from: normalizedToday, to: normalizedToday };
  }
};

const normalizeRange = (range) => {
  if (!range) return range;
  const from = range?.from ? startOfDay(range.from) : undefined;
  const to = range?.to ? endOfDay(range.to) : undefined;
  return { from, to };
};

const areRangesEqual = (first, second) => {
  if (!first?.from || !first?.to || !second?.from || !second?.to) {
    return false;
  }
  return isSameDay(first.from, second.from) && isSameDay(first.to, second.to);
};

export function PeriodSelector({ dateRange, setDateRange, className, onApply }) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [activePreset, setActivePreset] = React.useState(null);

  React.useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) {
      setActivePreset(null);
      return;
    }

    const normalized = normalizeRange(dateRange);
    const matchedPreset = PRESETS.find((preset) =>
      areRangesEqual(normalized, getPresetRange(preset.value))
    );

    setActivePreset(matchedPreset?.value ?? null);
  }, [dateRange?.from, dateRange?.to]);

  const handlePresetSelect = (preset) => {
    const nextRange = getPresetRange(preset.value);
    setActivePreset(preset.value);
    setDateRange(nextRange);
    onApply?.(nextRange);
    setIsDropdownOpen(false);
  };

  const handleCalendarSelect = (range) => {
    setActivePreset(null);
    setDateRange(range);

    if (!range?.from || !range?.to) {
      return;
    }

    const normalized = normalizeRange(range);
    const matchedPreset = PRESETS.find((preset) =>
      areRangesEqual(normalized, getPresetRange(preset.value))
    );

    const finalRange = matchedPreset
      ? getPresetRange(matchedPreset.value)
      : normalized;

    setActivePreset(matchedPreset?.value ?? null);
    setDateRange(finalRange);
    onApply?.(finalRange);
    setIsDropdownOpen(false);
  };

  const handleApplyClick = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return;
    }

    const normalized = normalizeRange(dateRange);
    const matchedPreset = PRESETS.find((preset) =>
      areRangesEqual(normalized, getPresetRange(preset.value))
    );

    const finalRange = matchedPreset
      ? getPresetRange(matchedPreset.value)
      : normalized;

    setActivePreset(matchedPreset?.value ?? null);
    setDateRange(finalRange);
    onApply?.(finalRange);
    setIsDropdownOpen(false);
  };

  const displayRange = React.useMemo(() => {
    if (activePreset) {
      const preset = PRESETS.find((item) => item.value === activePreset);
      if (preset) {
        return preset.label;
      }
    }

    if (dateRange?.from && dateRange?.to) {
      return (
        format(dateRange.from, 'dd/MM/yyyy') +
        ' - ' +
        format(dateRange.to, 'dd/MM/yyyy')
      );
    }

    if (dateRange?.from) {
      return format(dateRange.from, 'dd/MM/yyyy');
    }

    return 'Selecione um período';
  }, [activePreset, dateRange?.from, dateRange?.to]);

  const pickerRange = React.useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) {
      return undefined;
    }

    return {
      from: dateRange?.from ? startOfDay(dateRange.from) : undefined,
      to: dateRange?.to ? startOfDay(dateRange.to) : undefined,
    };
  }, [dateRange?.from, dateRange?.to]);

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'gap-2 justify-start text-left font-normal text-[#e2e8f0] focus-visible:ring-emerald-400',
            !dateRange?.from && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span>{displayRange}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[560px] max-w-[90vw] rounded-2xl border border-[#243347] bg-[#0f1624] p-4 text-[#e2e8f0] shadow-[0_24px_48px_rgba(4,19,14,0.45)]"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  className={cn(
                    'w-full rounded-full border border-emerald-900/40 bg-transparent px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1624] hover:bg-[#0f2b22]',
                    isActive && 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                  )}
                  onClick={() => handlePresetSelect(preset)}
                  aria-pressed={isActive}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-[#243347] bg-[#0e1623] p-3 shadow-inner">
            <DayPicker
              mode="range"
              selected={pickerRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              weekStartsOn={1}
              captionLayout="dropdown"
              locale={ptBR}
              fromYear={2000}
              toYear={new Date().getFullYear() + 5}
              defaultMonth={pickerRange?.from ?? pickerRange?.to ?? new Date()}
              styles={{
                root: { color: '#e2e8f0' },
                caption: { color: '#cbd5f5' },
                head_cell: { color: '#94a3b8', fontWeight: 500 },
                nav_button: {
                  color: '#e2e8f0',
                  borderRadius: '9999px',
                },
                month: { backgroundColor: 'transparent' },
                day: {
                  color: '#e2e8f0',
                  borderRadius: '12px',
                  transition: 'background-color 0.15s ease',
                },
                day_selected: {
                  backgroundColor: '#10b981',
                  color: '#04130e',
                },
                day_range_start: {
                  backgroundColor: '#10b981',
                  color: '#04130e',
                },
                day_range_end: {
                  backgroundColor: '#10b981',
                  color: '#04130e',
                },
                day_range_middle: {
                  backgroundColor: '#064e3b',
                  color: '#e2e8f0',
                },
                day_disabled: { color: '#475569', opacity: 0.6 },
                day_outside: { color: '#475569', opacity: 0.5 },
                nav: { gap: '0.5rem' },
              }}
              className={cn(
                'rdp-dark mx-auto flex flex-col gap-3 text-sm',
                '[&_.rdp-caption_dropdowns]:flex [&_.rdp-caption_dropdowns]:gap-2 [&_.rdp-caption_dropdowns_select]:rounded-md',
                '[&_.rdp-caption_dropdowns_select]:border [&_.rdp-caption_dropdowns_select]:border-[#243347]',
                '[&_.rdp-caption_dropdowns_select]:bg-[#0f1624] [&_.rdp-caption_dropdowns_select]:px-2 [&_.rdp-caption_dropdowns_select]:py-1',
                '[&_.rdp-caption_dropdowns_select]:text-sm [&_.rdp-caption_dropdowns_select]:text-[#e2e8f0]',
                '[&_.rdp-caption_dropdowns_select]:focus-visible:outline-none [&_.rdp-caption_dropdowns_select]:focus-visible:ring-2',
                '[&_.rdp-caption_dropdowns_select]:focus-visible:ring-emerald-400',
                '[&_.rdp-months]:flex [&_.rdp-months]:flex-row [&_.rdp-months]:justify-center [&_.rdp-months]:gap-6',
                '[&_.rdp-month]:w-auto',
                '[&_.rdp-table]:w-full [&_.rdp-table]:border-collapse',
                '[&_.rdp-day]:h-10 [&_.rdp-day]:w-10'
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border border-transparent text-sm text-slate-300 hover:bg-[#0f2b22]"
              onClick={() => setIsDropdownOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-emerald-500 px-5 text-sm text-[#04130e] hover:bg-emerald-400 focus-visible:ring-emerald-300"
              disabled={!dateRange?.from || !dateRange?.to}
              onClick={handleApplyClick}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
