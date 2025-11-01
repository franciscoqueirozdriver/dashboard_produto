'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import FunnelPicker from '@/components/FunnelPicker';
import { writeFunnelsToURL } from '@/lib/url';

type FunnelPickerControlProps = {
  value: number[];
};

export default function FunnelPickerControl({ value }: FunnelPickerControlProps) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();

  const handleChange = React.useCallback(
    (ids: number[]) => {
      writeFunnelsToURL(ids);
      startTransition(() => {
        router.refresh();
      });
    },
    [router]
  );

  return <FunnelPicker value={value} onChange={handleChange} />;
}
