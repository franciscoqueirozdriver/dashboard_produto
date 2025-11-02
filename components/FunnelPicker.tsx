'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { fetchActiveFunnels } from '@/lib/exactspotter/funnels';
import { DEFAULT_SALES_FUNNEL_ID } from '@/lib/funnels/constants';

type FunnelItem = { id: number; name: string };

type FunnelPickerProps = {
  value: number[];
  onChange: (ids: number[]) => void;
};

export default function FunnelPicker({ value, onChange }: FunnelPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState<FunnelItem[]>([]);
  const applied = React.useMemo(() => {
    const unique = Array.isArray(value)
      ? Array.from(new Set(value.filter((id) => Number.isFinite(id))))
      : [];
    return unique.length > 0 ? unique : [DEFAULT_SALES_FUNNEL_ID];
  }, [value]);
  const [selected, setSelected] = React.useState<number[]>(applied);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    fetchActiveFunnels()
      .then((list) => {
        if (mounted) {
          setItems(list);
        }
      })
      .catch(() => {
        if (mounted) {
          setItems([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    if (!query) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  const toggle = (id: number) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const selectAll = () => {
    setSelected((current) => {
      const union = new Set(current);
      for (const item of filtered) {
        union.add(item.id);
      }
      return Array.from(union);
    });
  };

  const clearAll = () => {
    setSelected((current) => current.filter((id) => !filtered.some((item) => item.id === id)));
  };

  const applySelection = () => {
    const unique = Array.from(new Set(selected.filter((id) => Number.isFinite(id))));
    if (unique.length === 0) {
      setErrorMessage('Selecione ao menos um funil.');
      return;
    }
    setErrorMessage('');
    onChange(unique);
    setOpen(false);
  };

  const resolveLabel = () => {
    if (applied.length === 0) {
      return 'Funis (0)';
    }
    if (applied.length === 1) {
      const match = items.find((item) => item.id === applied[0]);
      return match ? `Funil: ${match.name}` : 'Funis (1)';
    }
    return `Funis (${applied.length})`;
  };

  const label = resolveLabel();

  React.useEffect(() => {
    if (open) {
      setSelected(applied);
      setErrorMessage('');
    }
  }, [open, applied]);

  const handleOpenChange = (next: boolean) => {
    setErrorMessage('');
    setOpen(next);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {label}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          avoidCollisions
          className="z-[60] w-[440px] rounded-xl border border-slate-700 bg-[#0f1624] p-3 text-slate-200 shadow-xl"
        >
          <div className="flex flex-col gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar funil..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <div className="max-h-72 overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <div className="rounded-lg bg-slate-900/60 px-3 py-6 text-center text-sm text-slate-400">
                  Nenhum funil encontrado
                </div>
              ) : (
                <ul className="space-y-1">
                  {filtered.map((item) => {
                    const checked = selected.includes(item.id);
                    return (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-slate-900/60">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                            checked={checked}
                            onChange={() => toggle(item.id)}
                          />
                          <span className="text-slate-100">{item.name}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-emerald-500/60 px-3 py-2 text-xs text-white hover:bg-emerald-500/10"
                  onClick={selectAll}
                >
                  Selecionar todos
                </button>
                <button
                  type="button"
                  className="rounded-full border border-emerald-500/60 px-3 py-2 text-xs text-white hover:bg-emerald-500/10"
                  onClick={clearAll}
                >
                  Limpar
                </button>
              </div>
              <button
                type="button"
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                onClick={applySelection}
              >
                Aplicar
              </button>
            </div>
            {errorMessage && (
              <p className="text-xs text-amber-300" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
