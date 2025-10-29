'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

export function StatusMiniChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="statusWon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="statusLost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f87171" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="statusOpen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" hide />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)' }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Area type="monotone" dataKey="won" stroke="#34d399" fill="url(#statusWon)" strokeWidth={2} stackId="1" />
        <Area type="monotone" dataKey="open" stroke="#60a5fa" fill="url(#statusOpen)" strokeWidth={2} stackId="1" />
        <Area type="monotone" dataKey="lost" stroke="#f87171" fill="url(#statusLost)" strokeWidth={2} stackId="1" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
