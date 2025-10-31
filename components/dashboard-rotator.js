'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardContent } from '@/app/dashboard/page';

const VIEWS = [
  {
    key: 'currentMonth',
    title: 'Mês Atual',
    description: 'Monitoramento em tempo real do funil comercial do mês atual com dados oficiais da Exact Spotter.',
  },
  {
    key: 'currentYear',
    title: 'Ano Atual',
    description: 'Monitoramento em tempo real do funil comercial do ano atual com dados oficiais da Exact Spotter.',
  },
  {
    key: 'last12Months',
    title: 'Últimos 12 Meses',
    description: 'Monitoramento em tempo real do funil comercial dos últimos 12 meses com dados oficiais da Exact Spotter.',
  },
];

const DEFAULT_DURATION = 30000; // 30 segundos em milissegundos

export function DashboardRotator({ allMetrics }) {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const searchParams = useSearchParams();

  const isRotatorEnabled = searchParams.get('rotator') !== 'false';

  useEffect(() => {
    if (isPaused || !isRotatorEnabled) return;

    const timer = setInterval(() => {
      setCurrentViewIndex((prevIndex) => (prevIndex + 1) % VIEWS.length);
    }, DEFAULT_DURATION);

    return () => clearInterval(timer);
  }, [isPaused, isRotatorEnabled]);

  const currentView = VIEWS[currentViewIndex];
  const metrics = allMetrics[currentView.key];

  return (
    <>
      <DashboardContent
        metrics={metrics}
        periodTitle={currentView.title}
        periodDescription={currentView.description}
      />
      {/* Botão flutuante para pausar/retomar a rotação (opcional, mas útil) */}
      {isRotatorEnabled && (
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="fixed bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg z-50"
          title={isPaused ? 'Retomar Rotação' : 'Pausar Rotação'}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>
      )}
    </>
  );
}
