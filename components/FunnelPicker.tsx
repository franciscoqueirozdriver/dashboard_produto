'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import Select, { type MultiValue } from 'react-select';
import { DEFAULT_SALES_FUNNEL_ID } from '@/lib/funnels/constants';
import { readFunnelsFromURL } from '@/lib/url';

type Funnel = { id: number; name: string };
type Opt = { value: number; label: string };

type FunnelPickerProps = {
  value: number[];
  onChange?: (ids: number[]) => void;
};

const DEFAULT_FUNNEL_LABEL = 'Vendas';

const sanitizeIds = (input: number[] | undefined | null) => {
  const unique = Array.isArray(input)
    ? Array.from(new Set(input.filter((id) => Number.isFinite(id))))
    : [];
  return unique.length > 0 ? unique : [DEFAULT_SALES_FUNNEL_ID];
};

export default function FunnelPicker({ value, onChange }: FunnelPickerProps) {
  const sanitizedProp = React.useMemo(() => sanitizeIds(value), [value]);
  const [applied, setApplied] = React.useState<number[]>(() => {
    const fromUrl = readFunnelsFromURL();
    const uniqueUrl = Array.from(
      new Set(fromUrl.filter((id) => Number.isFinite(id)))
    );
    return uniqueUrl.length > 0 ? uniqueUrl : sanitizedProp;
  });
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<Opt[]>(() =>
    sanitizedProp.length === 1 && sanitizedProp[0] === DEFAULT_SALES_FUNNEL_ID
      ? [{ value: DEFAULT_SALES_FUNNEL_ID, label: DEFAULT_FUNNEL_LABEL }]
      : []
  );
  const [sel, setSel] = React.useState<number[]>(() => [...applied]);

  React.useEffect(() => {
    setApplied((current) => {
      const next = sanitizedProp;
      if (
        current.length === next.length &&
        current.every((id, index) => id === next[index])
      ) {
        return current;
      }
      return next;
    });
  }, [sanitizedProp]);

  React.useEffect(() => {
    if (open) {
      setSel(applied);
    }
  }, [open, applied]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    fetch('/api/funnels', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load funnels');
        }
        return response.json();
      })
      .then((payload: { value?: Funnel[] }) => {
        if (cancelled) return;
        const mapped = Array.isArray(payload?.value)
          ? payload.value
              .map((item) => ({
                value: Number(item.id),
                label: String(item.name ?? ''),
              }))
              .filter(
                (item) =>
                  Number.isFinite(item.value) && item.label.trim().length > 0
              )
          : [];
        const deduped = Array.from(
          new Map(mapped.map((item) => [item.value, item])).values()
        );
        setOptions(deduped);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        if (
          sanitizedProp.length === 1 &&
          sanitizedProp[0] === DEFAULT_SALES_FUNNEL_ID
        ) {
          setOptions([{ value: DEFAULT_SALES_FUNNEL_ID, label: DEFAULT_FUNNEL_LABEL }]);
        } else {
          setOptions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, sanitizedProp]);

  const apply = React.useCallback(() => {
    if (sel.length === 0) {
      setOpen(false);
      return;
    }

    const unique = Array.from(new Set(sel.filter((id) => Number.isFinite(id))));
    if (unique.length === 0) {
      setOpen(false);
      return;
    }

    setApplied(unique);
    onChange?.(unique);
    setOpen(false);
  }, [sel, onChange]);

  const cancel = React.useCallback(() => {
    setSel(applied);
    setOpen(false);
  }, [applied]);

  const label = React.useMemo(() => {
    if (applied.length === 1) {
      const match =
        options.find((option) => option.value === applied[0]) ??
        (applied[0] === DEFAULT_SALES_FUNNEL_ID
          ? { value: DEFAULT_SALES_FUNNEL_ID, label: DEFAULT_FUNNEL_LABEL }
          : undefined);
      return match ? `Funil: ${match.label}` : 'Funil: Selecionado';
    }
    return `Funis (${applied.length})`;
  }, [applied, options]);

  const selectedOptions = React.useMemo(() => {
    const optionMap = new Map(options.map((item) => [item.value, item]));
    return sel
      .map((id) => {
        if (optionMap.has(id)) {
          return optionMap.get(id)!;
        }
        if (id === DEFAULT_SALES_FUNNEL_ID) {
          return { value: id, label: DEFAULT_FUNNEL_LABEL } as Opt;
        }
        return { value: id, label: `Funil #${id}` } as Opt;
      })
      .filter((item, index, array) =>
        array.findIndex((opt) => opt.value === item.value) === index
      );
  }, [options, sel]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
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
          <Select
            isMulti
            options={options}
            value={selectedOptions}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            onChange={(vals: MultiValue<Opt>) =>
              setSel(Array.from(vals, (item) => item.value))
            }
            placeholder="Buscar/selecionar funis..."
            noOptionsMessage={() => 'Nenhum funil encontrado'}
            styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: '#0b1220',
                borderColor: '#10b981',
                boxShadow: state.isFocused
                  ? '0 0 0 2px rgba(16,185,129,.4)'
                  : 'none',
                ':hover': { borderColor: '#10b981' },
                minHeight: 40,
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: 'rgba(16,185,129,.15)',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#e5e7eb',
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: '#a7f3d0',
                ':hover': {
                  backgroundColor: 'rgba(16,185,129,.25)',
                  color: '#064e3b',
                },
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#0f1624',
                border: '1px solid #334155',
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: 5 * 42,
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? 'rgba(16,185,129,.08)'
                  : 'transparent',
                color: '#e5e7eb',
                ':active': { backgroundColor: 'rgba(16,185,129,.15)' },
              }),
              input: (base) => ({ ...base, color: '#e5e7eb' }),
              placeholder: (base) => ({ ...base, color: '#94a3b8' }),
              singleValue: (base) => ({ ...base, color: '#e5e7eb' }),
              indicatorsContainer: (base) => ({ ...base, color: '#e5e7eb' }),
            }}
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={cancel}
              className="px-3 py-2 text-sm rounded-md border border-emerald-500 text-white hover:bg-emerald-500/10"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={apply}
              className="px-3 py-2 text-sm rounded-md bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              Aplicar
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
