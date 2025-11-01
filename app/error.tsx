'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  console.error('[RouteError]', error);
  return (
    <div className="p-6">
      <h2>Não conseguimos renderizar esta página.</h2>
      <button onClick={() => reset()}>Tentar novamente</button>
    </div>
  );
}
