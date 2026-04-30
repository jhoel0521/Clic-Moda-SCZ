'use client';

import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@src/core/store/useToastStore';

const CONFIG = {
  success: { Icon: CheckCircle2, iconClass: 'text-green-500', wrapClass: 'border-green-200' },
  error:   { Icon: XCircle,      iconClass: 'text-red-500',   wrapClass: 'border-red-200'   },
  info:    { Icon: Info,         iconClass: 'text-blue-500',  wrapClass: 'border-blue-200'  },
} as const;

export function Toast() {
  const toasts  = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => {
        const { Icon, iconClass, wrapClass } = CONFIG[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-xl max-w-sm ${wrapClass}`}
          >
            <Icon size={18} className={`shrink-0 ${iconClass}`} />
            <p className="flex-1 text-sm font-medium text-gray-800">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-1 rounded-md p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
