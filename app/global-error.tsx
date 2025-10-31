'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  console.error('[GlobalError]', error);
  return (
    <html>
      <body className="p-6">
        <h1>Opa — algo deu errado.</h1>
        <p style={{opacity:.7}}>Tente atualizar ou voltar.</p>
        <button onClick={() => reset()}>Tentar novamente</button>
      </body>
    </html>
  );
}
