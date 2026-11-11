// Mejora progresiva de la galería: sin JavaScript las fotos van en columna; con él, un carrusel con botones
// "Foto anterior/siguiente", miniaturas tocables y el anuncio de la posición ("Foto 2 de 4").
export const clampIndex = (index: number, total: number): number =>
  Math.min(Math.max(index, 0), Math.max(total - 1, 0));

// Foto visible según el desplazamiento del carrusel.
export const indexAt = (scrollLeft: number, width: number, total: number): number =>
  width > 0 ? clampIndex(Math.round(scrollLeft / width), total) : 0;

interface Parts {
  track: HTMLElement;
  total: number;
  status: HTMLElement | null;
  thumbs: HTMLElement[];
  prev: HTMLButtonElement | null;
  next: HTMLButtonElement | null;
}

function partsOf(root: HTMLElement, controls: HTMLElement, track: HTMLElement): Parts {
  return {
    track,
    total: root.querySelectorAll('[data-slide]').length,
    status: controls.querySelector<HTMLElement>('[data-status]'),
    thumbs: [...controls.querySelectorAll<HTMLElement>('[data-thumb]')],
    prev: controls.querySelector<HTMLButtonElement>('[data-prev]'),
    next: controls.querySelector<HTMLButtonElement>('[data-next]'),
  };
}

const currentOf = ({ track, total }: Parts): number =>
  indexAt(track.scrollLeft, track.clientWidth, total);

function render(parts: Parts): void {
  const index = currentOf(parts);
  if (parts.status)
    parts.status.textContent = `Foto ${String(index + 1)} de ${String(parts.total)}`;
  parts.thumbs.forEach((thumb, i) => thumb.setAttribute('aria-current', String(i === index)));
  if (parts.prev) parts.prev.disabled = index === 0;
  if (parts.next) parts.next.disabled = index === parts.total - 1;
}

function wire(parts: Parts): void {
  const goTo = (index: number): void => {
    const left = clampIndex(index, parts.total) * parts.track.clientWidth;
    parts.track.scrollTo({ left, behavior: 'smooth' });
  };
  parts.prev?.addEventListener('click', () => goTo(currentOf(parts) - 1));
  parts.next?.addEventListener('click', () => goTo(currentOf(parts) + 1));
  parts.thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => goTo(i)));
  parts.track.addEventListener('scroll', () => requestAnimationFrame(() => render(parts)), {
    passive: true,
  });
}

function initGallery(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('[data-track]');
  const controls = root.querySelector<HTMLElement>('[data-controls]');
  if (!track || !controls || root.querySelectorAll('[data-slide]').length < 2) return;
  root.classList.add('is-carousel');
  controls.hidden = false;
  track.tabIndex = 0;
  const parts = partsOf(root, controls, track);
  wire(parts);
  render(parts);
}

export function initGalleries(): void {
  document.querySelectorAll<HTMLElement>('[data-gallery]').forEach(initGallery);
}
