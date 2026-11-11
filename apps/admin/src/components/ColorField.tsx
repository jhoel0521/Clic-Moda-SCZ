import { useId } from 'react';
import { checkContrast, contrastRatio, PAGE_BACKGROUND, WHITE } from '../lib/palette';
import Icon from './Icon';
import { Button } from './ui';

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

const isHex = (value: string): boolean => /^#[0-9a-f]{6}$/i.test(value.trim());
const INPUT = 'border-border bg-surface rounded-xl border';

// Estado del contraste: siempre con ícono y texto, nunca solo color.
function Verdict({ color, onApply }: { color: string; onApply: (value: string) => void }) {
  const report = checkContrast(color);
  if (report.ok) {
    const ratio = contrastRatio(WHITE, color).toFixed(2);
    return (
      <p className="text-success flex items-center gap-2 text-sm font-medium">
        <Icon name="check" className="size-4" />
        Cumple el contraste AA ({ratio}:1 con texto blanco)
      </p>
    );
  }
  return (
    <div role="alert" className="text-danger flex flex-col items-start gap-2 text-sm font-medium">
      <p className="flex items-start gap-2">
        <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
        {report.reasons.join('. ')}
      </p>
      {report.suggestion && (
        <Button variant="secondary" onClick={() => onApply(report.suggestion as string)}>
          Usar {report.suggestion}
        </Button>
      )}
    </div>
  );
}

function Inputs({ id, value, onChange, invalid }: Props & { id: string; invalid: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        aria-label="Elegir color"
        value={isHex(value) ? value : PAGE_BACKGROUND}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT} size-12 shrink-0 cursor-pointer p-1`}
      />
      <input
        id={id}
        value={value}
        maxLength={7}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid ? true : undefined}
        className={`${INPUT} min-h-12 w-full px-4 font-mono text-base`}
      />
    </div>
  );
}

// Color de la marca: selector, código #rrggbb y aviso de contraste en vivo (el mismo cálculo que la API).
export default function ColorField({ value, onChange, error }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        Color principal
      </label>
      <Inputs id={id} value={value} onChange={onChange} invalid={!!error} />
      {isHex(value) ? (
        <Verdict color={value} onApply={onChange} />
      ) : (
        <p className="text-muted text-sm">Formato #rrggbb</p>
      )}
      {error && (
        <p role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
