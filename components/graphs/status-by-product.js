'use client';

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function StatusByProductChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 10, left: 40, right: 30, bottom: 10 }}>
        <XAxis type="number" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis dataKey="product" type="category" tick={{ fill: '#cbd5f5', fontSize: 14 }} width={220} />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)' }} />
        <Legend wrapperStyle={{ color: '#e2e8f0' }} />
        <Bar dataKey="won" stackId="status" fill="#34d399" radius={[0, 8, 8, 0]} name="Ganho" />
        <Bar dataKey="open" stackId="status" fill="#60a5fa" name="Em andamento" />
        <Bar dataKey="lost" stackId="status" fill="#f87171" name="Perdido" />
      </BarChart>
    </ResponsiveContainer>
  );
}
