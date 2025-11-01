'use client';

import * as React from 'react';

type FunnelsEmptyStateProps = {
  title?: string;
  message?: string;
};

export function FunnelsEmptyState({
  title = 'Nenhum funil selecionado',
  message = 'Selecione ao menos um funil para visualizar os dados.',
}: FunnelsEmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-800/40 bg-[#0c1812] px-6 py-10 text-center text-emerald-100 shadow-inner">
      <h2 className="text-xl font-semibold text-emerald-300">{title}</h2>
      <p className="max-w-xl text-sm text-emerald-100/80">{message}</p>
    </div>
  );
}
