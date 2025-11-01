'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, PauseCircle, PlayCircle } from 'lucide-react';
import { PeriodSelector } from '@/components/ui/period-selector';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

const DEFAULT_ORDER = [
  { path: '/dashboard', seconds: 60 },
  { path: '/status-produto', seconds: 30 },
  { path: '/performance', seconds: 30 },
  { path: '/top-produtos', seconds: 30 },
  { path: '/ticket-medio', seconds: 30 },
  { path: '/motivos-descarte', seconds: 30 },
];

export default function AutoRotate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dateRange, setDateRange] = useState(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    return from && to ? { from: new Date(from), to: new Date(to) } : null;
  });
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef();

  const scheduleNext = useCallback(
    (index, durations) => {
      const current = durations[index] ?? DEFAULT_ORDER[index]?.seconds ?? 30;
      timerRef.current = setTimeout(() => {
        const nextIndex = (index + 1) % DEFAULT_ORDER.length;
        const next = DEFAULT_ORDER[nextIndex];
        if (!next) return;
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.delete('durations'); // Não queremos propagar durations
        const queryString = currentParams.toString();
        router.replace(queryString ? `${next.path}?${queryString}` : next.path);
      }, current * 1000);
    },
    [router, searchParams]
  );

  const durations = useMemo(() => {
    const raw = searchParams.get('durations');
    if (!raw) return DEFAULT_ORDER.map((item) => item.seconds);
    const parts = raw
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => !Number.isNaN(value) && value > 0);
    if (parts.length === DEFAULT_ORDER.length) {
      return parts;
    }
    if (parts.length) {
      return DEFAULT_ORDER.map((item, index) => parts[index] ?? item.seconds);
    }
    return DEFAULT_ORDER.map((item) => item.seconds);
  }, [searchParams]);

  useEffect(() => {
    if (isPaused) {
      return () => undefined;
    }
    const currentIndex = DEFAULT_ORDER.findIndex((item) => item.path === pathname);
    if (currentIndex === -1) return undefined;
    scheduleNext(currentIndex, durations);
    return () => clearTimeout(timerRef.current);
  }, [pathname, durations, isPaused, scheduleNext]);

  const goNext = useCallback(() => {
    const currentIndex = DEFAULT_ORDER.findIndex((item) => item.path === pathname);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % DEFAULT_ORDER.length;
    const next = DEFAULT_ORDER[nextIndex];
    if (!next) return;
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete('durations');
    const queryString = currentParams.toString();
    router.replace(queryString ? `${next.path}?${queryString}` : next.path);
  }, [pathname, router, searchParams]);

  const goPrevious = useCallback(() => {
    const currentIndex = DEFAULT_ORDER.findIndex((item) => item.path === pathname);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + DEFAULT_ORDER.length) % DEFAULT_ORDER.length;
    const prev = DEFAULT_ORDER[prevIndex];
    if (!prev) return;
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete('durations');
    const queryString = currentParams.toString();
    router.replace(queryString ? `${prev.path}?${queryString}` : prev.path);
  }, [pathname, router, searchParams]);

  const handlePeriodChange = useCallback((newRange) => {
    setDateRange(newRange);
    const currentParams = new URLSearchParams(searchParams.toString());
    if (newRange && newRange.from && newRange.to) {
      currentParams.set('from', format(newRange.from, 'yyyy-MM-dd'));
      currentParams.set('to', format(newRange.to, 'yyyy-MM-dd'));
    } else {
      currentParams.delete('from');
      currentParams.delete('to');
    }
    currentParams.delete('durations');
    const queryString = currentParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }, [router, pathname, searchParams]);

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      clearTimeout(timerRef.current);
      setIsPaused(true);
    }
  };

  return (
    <div className="relative min-h-screen">
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex gap-2">
        <PeriodSelector
          dateRange={dateRange}
          setDateRange={setDateRange}
          onApply={handlePeriodChange}
          className="pointer-events-auto"
        />
        <Button
          onClick={goPrevious}
          size="sm"
          variant="outline"
          className="pointer-events-auto gap-2 bg-card/80 text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </Button>
        <Button
          onClick={goNext}
          size="sm"
          variant="outline"
          className="pointer-events-auto gap-2 bg-card/80 text-foreground"
        >
          <ArrowRight className="h-5 w-5" />
          Avançar
        </Button>
        <Button
          onClick={togglePause}
          size="sm"
          variant="outline"
          className="pointer-events-auto gap-2 bg-card/80 text-foreground"
        >
          {isPaused ? (
            <>
              <PlayCircle className="h-5 w-5" />
              Retomar
            </>
          ) : (
            <>
              <PauseCircle className="h-5 w-5" />
              Pausar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
