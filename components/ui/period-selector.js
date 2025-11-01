'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DateRangePicker } from 'react-date-range';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const SELECTION_KEY = 'selection';
const localeWithMonday = {
  ...ptBR,
  options: { ...ptBR.options, weekStartsOn: 1 },
};

const presetFactories = [
  {
    label: 'Hoje',
    create: () => {
      const today = new Date();
      const start = startOfDay(today);
      const end = startOfDay(today);
      return { startDate: start, endDate: end, key: SELECTION_KEY };
    },
  },
  {
    label: 'Últimos 7 dias',
    create: () => {
      const end = startOfDay(new Date());
      const start = startOfDay(addDays(end, -6));
      return { startDate: start, endDate: end, key: SELECTION_KEY };
    },
  },
  {
    label: 'Semana Atual',
    create: () => {
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      return { startDate: startOfDay(start), endDate: startOfDay(end), key: SELECTION_KEY };
    },
  },
  {
    label: 'Últimos 30 dias',
    create: () => {
      const end = startOfDay(new Date());
      const start = startOfDay(addDays(end, -29));
      return { startDate: start, endDate: end, key: SELECTION_KEY };
    },
  },
  {
    label: 'Mês Passado',
    create: () => {
      const reference = subMonths(new Date(), 1);
      const start = startOfMonth(reference);
      const end = endOfMonth(reference);
      return { startDate: startOfDay(start), endDate: startOfDay(end), key: SELECTION_KEY };
    },
  },
  {
    label: 'Mês Atual',
    create: () => {
      const now = new Date();
      const start = startOfMonth(now);
      return { startDate: startOfDay(start), endDate: startOfDay(now), key: SELECTION_KEY };
    },
  },
  {
    label: 'Ano Atual',
    create: () => {
      const now = new Date();
      const start = startOfYear(now);
      return { startDate: startOfDay(start), endDate: startOfDay(now), key: SELECTION_KEY };
    },
  },
];

function toSelection(range) {
  if (!range || (!range.from && !range.to)) {
    return null;
  }

  const start = range.from ? startOfDay(range.from) : undefined;
  const end = range.to ? startOfDay(range.to) : start;

  if (!start) {
    return null;
  }

  return {
    startDate: start,
    endDate: end ?? start,
    key: SELECTION_KEY,
  };
}

function toExternalRange(selection) {
  if (!selection || !selection.startDate || !selection.endDate) {
    return null;
  }
  return {
    from: startOfDay(selection.startDate),
    to: startOfDay(selection.endDate),
  };
}

function isSameDayRange(a, b) {
  if (!a || !b) return false;
  return (
    a.startDate?.toDateString() === b.startDate?.toDateString() &&
    a.endDate?.toDateString() === b.endDate?.toDateString()
  );
}

export function PeriodSelector({ dateRange, setDateRange, className, onApply }) {
  const [open, setOpen] = React.useState(false);
  const pendingStartRef = React.useRef(null);

  const normalizedSelection = React.useMemo(() => {
    return (
      toSelection(dateRange) ?? {
        startDate: startOfYear(new Date()),
        endDate: startOfDay(new Date()),
        key: SELECTION_KEY,
      }
    );
  }, [dateRange]);

  const [selection, setSelection] = React.useState(normalizedSelection);

  React.useEffect(() => {
    setSelection(normalizedSelection);
    pendingStartRef.current = null;
  }, [normalizedSelection]);

  React.useEffect(() => {
    if (!open) {
      pendingStartRef.current = null;
    }
  }, [open]);

  const matchedPresetLabel = React.useMemo(() => {
    return (
      presetFactories.find((preset) => isSameDayRange(selection, preset.create()))?.label ??
      null
    );
  }, [selection]);

  const buttonLabel = React.useMemo(() => {
    if (matchedPresetLabel) {
      return matchedPresetLabel;
    }

    const external = toExternalRange(selection);
    if (external?.from && external?.to) {
      return `${format(external.from, 'dd/MM/yyyy')} – ${format(external.to, 'dd/MM/yyyy')}`;
    }
    return 'Selecione um período';
  }, [matchedPresetLabel, selection]);

  const applyRange = React.useCallback(
    (nextSelection) => {
      setSelection(nextSelection);
      const external = toExternalRange(nextSelection);
      if (external) {
        setDateRange(external);
        onApply?.(external);
      }
      pendingStartRef.current = null;
    },
    [onApply, setDateRange]
  );

  const handlePresetClick = React.useCallback(
    (factory) => {
      const next = factory.create();
      applyRange(next);
      setOpen(false);
    },
    [applyRange]
  );

  const handleApplyClick = React.useCallback(() => {
    applyRange(selection);
    setOpen(false);
  }, [applyRange, selection]);

  const handleRangeChange = React.useCallback(
    (ranges) => {
      const rawSelection = ranges?.selection ?? ranges;
      if (!rawSelection) return;

      const nextSelection = {
        startDate: rawSelection.startDate ?? selection.startDate,
        endDate: rawSelection.endDate ?? rawSelection.startDate ?? selection.endDate,
        key: SELECTION_KEY,
      };

      setSelection(nextSelection);

      const external = toExternalRange(nextSelection);
      if (external) {
        setDateRange(external);
      }

      if (!pendingStartRef.current && rawSelection.startDate) {
        pendingStartRef.current = rawSelection.startDate;
        return;
      }

      if (pendingStartRef.current && rawSelection.endDate) {
        pendingStartRef.current = null;
        if (external) {
          onApply?.(external);
        }
        setOpen(false);
      }
    },
    [onApply, selection, setDateRange]
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2 bg-[#0e1623] text-sm font-medium text-emerald-200 hover:bg-emerald-500/10',
            className
          )}
          aria-label="Abrir seletor de período"
        >
          <CalendarIcon className="h-4 w-4" />
          <span>{buttonLabel}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          className="w-[720px] max-w-[95vw] rounded-xl border border-[#243347] bg-[#0f1624] p-4 text-slate-200 shadow-xl focus:outline-none"
        >
          <div className="flex flex-wrap gap-2 pb-3">
            {presetFactories.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="rounded-full border border-emerald-900/40 bg-[#0b1f1a] px-3 py-2 text-xs font-medium text-emerald-200 transition-colors hover:bg-[#0f2b22] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1624]"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <DateRangePicker
            onChange={handleRangeChange}
            moveRangeOnFirstSelection={false}
            months={2}
            direction="horizontal"
            showDateDisplay={false}
            ranges={[selection]}
            rangeColors={['#10b981']}
            monthDisplayFormat="LLLL yyyy"
            weekdayDisplayFormat="EEEEE"
            locale={localeWithMonday}
            showPreview={false}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleApplyClick}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-[#04130e] transition-colors hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1624]"
            >
              Aplicar
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
