'use client';

import * as React from 'react';
import { fetchActiveFunnels } from '@/lib/exactspotter/funnels';

type FunnelItem = { id: number; name: string };

type FunnelPickerProps = {
  value: number[];
  onChange: (ids: number[]) => void;
};

export default function FunnelPicker({ value, onChange }: FunnelPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState<FunnelItem[]>([]);
  const [selected, setSelected] = React.useState<number[]>(value ?? []);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    setSelected(value ?? []);
  }, [value]);

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
    onChange(selected);
    setOpen(false);
  };

  const resolveLabel = () => {
    if (selected.length === 0) {
      return 'Funis (0)';
    }
    if (selected.length === 1) {
      const match = items.find((item) => item.id === selected[0]);
      return `Funil: ${match?.name ?? selected[0]}`;
    }
    return `Funis (${selected.length})`;
  };

  const label = resolveLabel();

  React.useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!panelRef.current) return;
      if (
        event.target instanceof Node &&
        panelRef.current !== event.target &&
        !panelRef.current.contains(event.target) &&
        triggerRef.current !== event.target &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  React.useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        className="rounded-lg border border-emerald-600 bg-[#0e1623] px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        onClick={() => setOpen((state) => !state)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[420px] rounded-2xl border border-slate-800 bg-[#0f1624] p-4 text-slate-200 shadow-xl outline-none"
        >
          <div className="flex flex-col gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar funil..."
              className="w-full rounded-lg border border-slate-700 bg-[#0e1623] px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
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
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-slate-800/60">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                  onClick={selectAll}
                  className="rounded-full border border-emerald-900/40 bg-[#0b1f1a] px-3 py-2 text-xs font-semibold text-emerald-200 transition-colors hover:bg-[#0f2b22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Selecionar todos
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Limpar
                </button>
              </div>
              <button
                type="button"
                onClick={applySelection}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-[#04130e] transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
