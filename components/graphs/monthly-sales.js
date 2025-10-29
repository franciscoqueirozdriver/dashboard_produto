'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export function SalesByMonthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
        <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1f2933' }} />
        <YAxis
          tickFormatter={(value) => currency.format(value)}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#1f2933' }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)' }}
          formatter={(value) => currency.format(value)}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Bar dataKey="revenue" fill="#22d3ee" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
