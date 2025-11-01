'use client';

import * as React from 'react';
import { fetchActiveFunnels } from '@/lib/exactspotter/funnels';
import { Button } from '@/components/ui/button';

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
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 bg-card/80 text-foreground"
        onClick={() => setOpen((state) => !state)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
      </Button>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[420px] rounded-2xl border border-slate-800 bg-card p-4 text-foreground shadow-xl outline-none"
        >
          <div className="flex flex-col gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar funil..."
              className="w-full rounded-lg border border-slate-700 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <div className="max-h-72 overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <div className="rounded-lg bg-muted/60 px-3 py-6 text-center text-sm text-muted-foreground">
                  Nenhum funil encontrado
                </div>
              ) : (
                <ul className="space-y-1">
                  {filtered.map((item) => {
                    const checked = selected.includes(item.id);
                    return (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/60">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-600 bg-background text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                            checked={checked}
                            onChange={() => toggle(item.id)}
                          />
                          <span className="text-foreground">{item.name}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-card/80 text-foreground"
                  onClick={selectAll}
                >
                  Selecionar todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-card/80 text-foreground"
                  onClick={clearAll}
                >
                  Limpar
                </Button>
              </div>
              <Button type="button" variant="default" size="sm" onClick={applySelection}>
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
