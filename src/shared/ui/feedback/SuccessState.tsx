'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessStateProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function SuccessState({ title, description, children }: SuccessStateProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="text-center">
      <div
        className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50 transition-all duration-500 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
      >
        <CheckCircle size={48} className="text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3">{title}</h1>
      {description && (
        <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">{description}</p>
      )}
      {children}
    </div>
  );
}
