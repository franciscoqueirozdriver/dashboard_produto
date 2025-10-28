'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function AverageTicketChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, left: 20, right: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
        <XAxis dataKey="product" tick={{ fill: '#cbd5f5', fontSize: 12 }} tickLine={false} />
        <YAxis
          tickFormatter={(value) => currency.format(value)}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => currency.format(value)}
          contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)' }}
        />
        <Bar dataKey="ticket" fill="#34d399" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
