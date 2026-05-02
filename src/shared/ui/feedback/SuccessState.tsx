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
          visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <CheckCircle size={48} className="text-green-500" />
      </div>
      <h1 className="text-text-primary mb-3 text-3xl font-bold">{title}</h1>
      {description && <p className="text-text-muted mx-auto mb-8 max-w-md">{description}</p>}
      {children}
    </div>
  );
}
