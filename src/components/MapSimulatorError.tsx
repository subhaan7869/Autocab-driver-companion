import React, { useState, useEffect } from 'react';
export function ErrorOverlay() {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const handleErr = (e: ErrorEvent) => setError(e.message);
    window.addEventListener('error', handleErr);
    return () => window.removeEventListener('error', handleErr);
  }, []);
  if (!error) return null;
  return <div style={{position: 'absolute', zIndex: 9999, background: 'red', color: 'white', padding: 20}}>Global Error: {error}</div>;
}
