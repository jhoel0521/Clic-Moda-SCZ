import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_REASON,
  fetchCommand,
  KIND_LABELS,
  KIND_UNITS_LABEL,
  newIdempotencyKey,
  rejectLabel,
  sendMovement,
  waitForCommand,
  type MovementKind,
  type StockCommand,
  type StockRow,
} from '../lib/stock';
import { errorMessage } from '../lib/types';
import Icon from './Icon';
import { Button, ErrorBanner, Field } from './ui';

type Phase = { tag: 'form' } | { tag: 'sending' } | { tag: 'done'; command: StockCommand | null };

// El movimiento no cambia el stock al instante: entra a la cola y el panel espera su resultado.
function useMovement(row: StockRow, kind: MovementKind, onDone: () => void) {
  const [phase, setPhase] = useState<Phase>({ tag: 'form' });
  const [error, setError] = useState<string | null>(null);
  const key = useRef(newIdempotencyKey()).current; // misma clave si se toca dos veces: no se duplica

  const submit = async (units: number, reason: string) => {
    setPhase({ tag: 'sending' });
    setError(null);
    try {
      const accepted = await sendMovement({ variantId: row.variantId, type: kind, units, reason, key });
      setPhase({ tag: 'done', command: await waitForCommand(accepted.id, { fetchCommand }) });
      onDone();
    } catch (failure) {
      setError(errorMessage(failure));
      setPhase({ tag: 'form' });
    }
  };
  return { phase, error, submit };
}

function SheetHeader({ row, kind }: { row: StockRow; kind: MovementKind }) {
  const detail = [`Talla ${row.size}`, row.color].filter(Boolean).join(' · ');
  return (
    <div>
      <h2 className="text-xl font-bold">{KIND_LABELS[kind]}</h2>
      <p className="font-semibold">{row.productName}</p>
      <p className="text-muted text-sm">
        {detail} · {row.sku} · Hay {row.available} disponibles
      </p>
    </div>
  );
}

const isValid = (kind: MovementKind, units: string, reason: string): boolean =>
  /^\d+$/.test(units) && (kind === 'ADJUST' || Number(units) > 0) && reason.trim().length >= 3;

interface FormProps {
  kind: MovementKind;
  busy: boolean;
  onSubmit: (units: number, reason: string) => void;
}

function SheetForm({ kind, busy, onSubmit }: FormProps) {
  const [units, setUnits] = useState('');
  const [reason, setReason] = useState(DEFAULT_REASON[kind]);
  const valid = isValid(kind, units, reason);
  const submit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (valid && !busy) onSubmit(Number(units), reason.trim());
  };
  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <Field
        label={KIND_UNITS_LABEL[kind]}
        inputMode="numeric"
        autoFocus
        value={units}
        onChange={(e) => setUnits(e.target.value)}
      />
      <Field label="Motivo" value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} />
      <Button type="submit" block disabled={!valid || busy}>
        {busy ? 'Enviando…' : 'Registrar'}
      </Button>
    </form>
  );
}

function resultOf(command: StockCommand | null): { tone: string; icon: 'check' | 'alert'; text: string } {
  if (!command)
    return {
      tone: 'text-warning',
      icon: 'alert',
      text: 'Sigue en cola: se aplicará en unos segundos. Puedes cerrar esta ventana.',
    };
  if (command.status === 'APPLIED')
    return { tone: 'text-success', icon: 'check', text: 'Listo: el stock ya se actualizó.' };
  return { tone: 'text-danger', icon: 'alert', text: rejectLabel(command.rejectReason) };
}

function SheetResult({ command, onClose }: { command: StockCommand | null; onClose: () => void }) {
  const result = resultOf(command);
  return (
    <div className="flex flex-col gap-4" role="status">
      <p className={`flex items-center gap-3 text-lg font-semibold ${result.tone}`}>
        <Icon name={result.icon} className="size-6 shrink-0" />
        {result.text}
      </p>
      <Button block onClick={onClose}>
        Cerrar
      </Button>
    </div>
  );
}

interface Props {
  row: StockRow;
  kind: MovementKind;
  onClose: () => void;
  onDone: () => void;
}

function SheetBody({ row, kind, onClose, onDone }: Props) {
  const { phase, error, submit } = useMovement(row, kind, onDone);
  return (
    <div className="pb-safe flex flex-col gap-5 p-5">
      <SheetHeader row={row} kind={kind} />
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {phase.tag === 'done' ? (
        <SheetResult command={phase.command} onClose={onClose} />
      ) : (
        <SheetForm kind={kind} busy={phase.tag === 'sending'} onSubmit={(u, r) => void submit(u, r)} />
      )}
      {phase.tag === 'sending' && (
        <p role="status" className="text-muted text-center">
          En cola… esperando el resultado
        </p>
      )}
    </div>
  );
}

// Hoja inferior en el móvil y ventana centrada en pantallas anchas (<dialog> nativo: foco y Escape gratis).
export default function MovementSheet(props: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={props.onClose}
      className="bg-surface mt-auto mb-0 max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-3xl p-0 backdrop:bg-black/40 md:m-auto md:max-w-md md:rounded-3xl"
    >
      <SheetBody {...props} />
    </dialog>
  );
}
