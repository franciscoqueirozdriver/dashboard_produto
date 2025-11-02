'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard-content';

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

export function DashboardRotator({
  allMetrics,
  showFloatingFab = false,
}) {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const searchParams = useSearchParams();

  const isRotatorEnabled = searchParams.get('rotator') !== 'false';
  const debugControlsEnabled = process.env.NEXT_PUBLIC_DEBUG_CONTROLS === '1';

  // Verifica se é período customizado
  const isCustomPeriod = 'customPeriod' in allMetrics;

  useEffect(() => {
    if (isPaused || !isRotatorEnabled || isCustomPeriod) return;

    const timer = setInterval(() => {
      setCurrentViewIndex((prevIndex) => (prevIndex + 1) % VIEWS.length);
    }, DEFAULT_DURATION);

    return () => clearInterval(timer);
  }, [isPaused, isRotatorEnabled, isCustomPeriod]);

  // Se for período customizado, usa o customPeriod
  const currentView = isCustomPeriod 
    ? { key: 'customPeriod', title: 'Período Customizado', description: 'Dados do período selecionado' }
    : VIEWS[currentViewIndex];
  const metrics = allMetrics[currentView.key];

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <h2 className="text-2xl font-bold mb-4 text-red-500">⚠️ Erro ao Carregar Dados</h2>
        <p className="text-lg text-muted-foreground">
          Não foi possível carregar os dados para o período: {currentView.title}.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Verifique sua conexão com a API Spotter.
        </p>
      </div>
    );
  }

  return (
    <>
      <DashboardContent
        metrics={metrics}
        periodTitle={currentView.title}
        periodDescription={currentView.description}
      />
      {/* Botão flutuante para pausar/retomar a rotação (visível apenas em modo debug ou quando solicitado) */}
      {isRotatorEnabled && (showFloatingFab || debugControlsEnabled) && (
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
