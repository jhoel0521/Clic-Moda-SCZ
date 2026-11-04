'use client';

import { resetDb } from '@src/backend/db/db';

/** Aviso permanente: evita que alguien crea que esta tienda cobra o despacha de verdad. */
export function DemoBar() {
  function handleReset() {
    resetDb();
    window.location.reload();
  }

  return (
    <div className="safe-top bg-gray-900 text-[12px] text-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-3 py-1">
        <span className="truncate">Demo: datos de ejemplo, nada se cobra</span>
        <span className="flex shrink-0 items-center">
          <button type="button" onClick={handleReset} className="px-2 py-1 font-semibold">
            Reiniciar
          </button>
        </span>
      </div>
    </div>
  );
}
