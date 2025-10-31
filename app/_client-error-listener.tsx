'use client';

import { useEffect } from 'react';

export default function ClientErrorListener() {
  useEffect(() => {
    const handler = (msg: any, url?: string, line?: number, col?: number, err?: any) => {
      try {
        fetch('/api/client-log', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ msg: String(msg), url, line, col, err: String(err) })
        });
      } catch {}
      return false;
    };
    const rej = (e: PromiseRejectionEvent) => {
      try {
        fetch('/api/client-log', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ unhandledRejection: String(e.reason) })
        });
      } catch {}
    };
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', rej);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', rej);
    };
  }, []);
  return null;
}
