import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { focalFromPointer, masterUrl, nudge, type Direction, type MediaItem } from '../lib/media';
import { IconButton } from './ui';

type Focal = { x: number; y: number };

const KEYS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Home: 'center',
};

// Arrastrar con el puntero o el dedo: el enfoque es la posición dentro de la foto original.
function useDrag(onChange: (focal: Focal) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (event: PointerEvent) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return;
    onChange(focalFromPointer({ x: event.clientX, y: event.clientY }, box));
  };
  const down = (event: PointerEvent) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    move(event);
  };
  return { ref, onPointerDown: down, onPointerMove: (e: PointerEvent) => e.buttons === 1 && move(e) };
}

const percent = (value: number): number => Math.round(value * 100);

interface MarkerProps {
  focal: Focal;
  onChange: (focal: Focal) => void;
  disabled?: boolean;
}

// Alternativa al arrastre (WCAG 2.5.7): el marcador se mueve con las flechas (Mayús = paso grande).
function Marker({ focal, onChange, disabled }: MarkerProps) {
  const onKeyDown = (event: KeyboardEvent) => {
    const direction = KEYS[event.key];
    if (!direction || disabled) return;
    event.preventDefault();
    onChange(nudge(focal, direction, event.shiftKey));
  };
  const label = `Punto de enfoque: horizontal ${percent(focal.x)} %, vertical ${percent(focal.y)} %. Muévelo con las flechas.`;
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onKeyDown={onKeyDown}
      style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
      className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
    >
      <span className="border-action size-6 rounded-full border-4 bg-white/80 shadow-lg" />
    </button>
  );
}

const PAD: { direction: Direction; icon: 'up' | 'down' | 'left' | 'right' | 'target'; label: string }[] = [
  { direction: 'left', icon: 'left', label: 'Mover el enfoque a la izquierda' },
  { direction: 'up', icon: 'up', label: 'Mover el enfoque hacia arriba' },
  { direction: 'down', icon: 'down', label: 'Mover el enfoque hacia abajo' },
  { direction: 'right', icon: 'right', label: 'Mover el enfoque a la derecha' },
  { direction: 'center', icon: 'target', label: 'Centrar el enfoque' },
];

function DirectionPad({ focal, onChange, disabled }: MarkerProps) {
  return (
    <div role="group" aria-label="Mover el enfoque" className="flex flex-wrap justify-center gap-1">
      {PAD.map((button) => (
        <IconButton
          key={button.direction}
          icon={button.icon}
          label={button.label}
          disabled={disabled}
          onClick={() => onChange(nudge(focal, button.direction, false))}
        />
      ))}
    </div>
  );
}

interface PhotoProps extends MarkerProps {
  item: MediaItem;
}

function PhotoWithMarker({ item, ...rest }: PhotoProps) {
  const drag = useDrag(rest.onChange);
  const live = !rest.disabled;
  return (
    <div
      ref={drag.ref}
      onPointerDown={live ? drag.onPointerDown : undefined}
      onPointerMove={live ? drag.onPointerMove : undefined}
      className="relative mx-auto w-full max-w-md touch-none overflow-hidden rounded-xl"
      style={{ aspectRatio: `${item.width} / ${item.height}` }}
    >
      <img
        src={masterUrl(item.id)}
        alt={`Foto original: ${item.alt}`}
        width={item.width}
        height={item.height}
        draggable={false}
        className="size-full select-none"
      />
      <Marker {...rest} />
    </div>
  );
}

export default function FocalPicker(props: PhotoProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">Punto de enfoque</p>
      <p className="text-muted text-sm">Toca o arrastra sobre la foto lo que no debe quedar recortado.</p>
      <PhotoWithMarker {...props} />
      <DirectionPad focal={props.focal} onChange={props.onChange} disabled={props.disabled} />
    </div>
  );
}
