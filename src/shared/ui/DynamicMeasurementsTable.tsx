import type { MedidasDinamicas } from '@src/core/models';

interface DynamicMeasurementsTableProps {
  medidas: MedidasDinamicas;
}

export function DynamicMeasurementsTable({ medidas }: DynamicMeasurementsTableProps) {
  const entries = Object.entries(medidas);
  if (entries.length === 0) return null;

  return (
    <div className="border-border overflow-hidden rounded-2xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-secondary">
            <th className="text-text-primary px-4 py-2.5 text-left font-semibold">Talla</th>
            <th className="text-text-primary px-4 py-2.5 text-left font-semibold">Medidas</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([size, rawMedidas], idx) => {
            const parts = String(rawMedidas)
              .split('|')
              .map((s) => s.trim());
            return (
              <tr key={size} className={idx % 2 === 0 ? 'bg-white' : 'bg-bg-secondary'}>
                <td className="text-brand px-4 py-2.5 font-bold">{size}</td>
                <td className="text-text-secondary px-4 py-2.5">
                  {parts.length > 1 ? (
                    <ul className="space-y-0.5">
                      {parts.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    String(rawMedidas)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
