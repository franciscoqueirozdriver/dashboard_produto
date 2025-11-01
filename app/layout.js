import './globals.css';
import './styles/daypicker-dark.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './styles/rdr-dark.css';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import AutoRotate from '@/components/auto-rotate';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Painel Gestão à Vista Spotter',
  description:
    'Dashboard em tempo real para indicadores comerciais com dados da API Exact Spotter.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn('bg-background text-foreground min-h-screen font-sans', inter.className)}>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
              Carregando painel…
            </div>
          }
        >
          <AutoRotate>{children}</AutoRotate>
        </Suspense>
      </body>
    </html>
  );
}
