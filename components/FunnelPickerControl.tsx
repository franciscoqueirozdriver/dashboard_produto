'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import FunnelPicker from '@/components/FunnelPicker';
import { writeFunnelsToURL } from '@/lib/url';
import { DEFAULT_SALES_FUNNEL_ID } from '@/lib/funnels/constants';

type FunnelPickerControlProps = {
  value: number[];
};

export default function FunnelPickerControl({ value }: FunnelPickerControlProps) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();
  const applied = React.useMemo(() => {
    const unique = Array.isArray(value)
      ? Array.from(new Set(value.filter((id) => Number.isFinite(id))))
      : [];
    return unique.length > 0 ? unique : [DEFAULT_SALES_FUNNEL_ID];
  }, [value]);

  const handleChange = React.useCallback(
    (ids: number[]) => {
      writeFunnelsToURL(ids);
      startTransition(() => {
        router.refresh();
      });
    },
    [router]
  );

  return <FunnelPicker value={applied} onChange={handleChange} />;
}
