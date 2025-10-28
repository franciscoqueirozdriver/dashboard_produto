'use client';

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#f87171', '#fb7185', '#f97316', '#facc15', '#38bdf8', '#a78bfa'];

export function DiscardReasonsChart({ data, keys }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 10, left: 60, right: 20, bottom: 10 }}>
        <XAxis type="number" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis dataKey="product" type="category" tick={{ fill: '#cbd5f5', fontSize: 14 }} width={240} />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)' }} />
        <Legend wrapperStyle={{ color: '#e2e8f0' }} />
        {keys.map((key, index) => (
          <Bar key={key} dataKey={key} stackId="reasons" fill={COLORS[index % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
