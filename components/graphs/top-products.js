'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function TopProductsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 10, left: 60, right: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
        <XAxis type="number" tickFormatter={(value) => currency.format(value)} tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis dataKey="product" type="category" tick={{ fill: '#cbd5f5', fontSize: 14 }} width={240} />
        <Tooltip
          formatter={(value) => currency.format(value)}
          contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)' }}
        />
        <Bar dataKey="revenue" fill="#fbbf24" radius={[0, 12, 12, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
