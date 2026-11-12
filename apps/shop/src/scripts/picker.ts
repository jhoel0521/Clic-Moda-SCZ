// Mejora progresiva del selector de talla y color. La elección vive en la URL (?talla=38&color=Negro) y el
// servidor arma precio, selector y botón de WhatsApp con ella; sin JavaScript el formulario GET recarga la página.
// Con JavaScript se pide esa misma página por fetch y se reemplaza SOLO el contenido de los bloques marcados
// con data-live, sin recargar: la pantalla no salta ni pierde la posición (en el teléfono se notaba mucho).
const FALLBACK = 'No se pudo actualizar; se recarga la página';

// URL de la elección: la talla y el color marcados, en el mismo orden que arma el formulario sin JavaScript.
export function selectionUrl(action: string, data: FormData): string {
  const query = new URLSearchParams();
  for (const key of ['talla', 'color']) {
    const value = data.get(key);
    if (typeof value === 'string' && value) query.set(key, value);
  }
  const text = query.toString();
  return text ? `${action}?${text}` : action;
}

// Copia el contenido de cada bloque data-live de la página nueva en el bloque de la actual (el contenedor
// se conserva: así la región aria-live sigue siendo la misma y los lectores de pantalla anuncian el cambio).
function swapLive(fresh: Document): void {
  document.querySelectorAll<HTMLElement>('[data-live]').forEach((block) => {
    const next = fresh.querySelector(`[data-live="${block.dataset.live ?? ''}"]`);
    if (next) block.innerHTML = next.innerHTML;
  });
}

// El foco vuelve a la opción que el visitante acababa de tocar (el reemplazo la recrea).
function restoreFocus(name: string | null, value: string | null): void {
  if (!name || value === null) return;
  const same = document.querySelector<HTMLInputElement>(
    `[data-variant-form] input[name="${name}"][value="${CSS.escape(value)}"]`
  );
  same?.focus({ preventScroll: true });
}

// Mientras llega la página nueva los bloques se atenúan y se marcan ocupados (la opción tocada ya se ve elegida).
function setBusy(busy: boolean): void {
  document.querySelectorAll('[data-live]').forEach((block) => {
    if (busy) block.setAttribute('aria-busy', 'true');
    else block.removeAttribute('aria-busy');
  });
}

let pending: AbortController | null = null;

async function apply(form: HTMLFormElement): Promise<void> {
  const url = selectionUrl(form.getAttribute('action') ?? location.pathname, new FormData(form));
  const active = document.activeElement as HTMLInputElement | null;
  const [name, value] = [active?.name ?? null, active?.value ?? null];
  pending?.abort();
  pending = new AbortController();
  setBusy(true);
  try {
    const response = await fetch(url, { headers: { Accept: 'text/html' }, signal: pending.signal });
    if (!response.ok) throw new Error(FALLBACK);
    swapLive(new DOMParser().parseFromString(await response.text(), 'text/html'));
    history.replaceState(null, '', url);
    restoreFocus(name, value);
    setBusy(false);
  } catch (error) {
    if ((error as Error).name === 'AbortError') return;
    setBusy(false);
    location.assign(url);
  }
}

function focusSizes(event: Event): void {
  event.preventDefault();
  const group = document.getElementById('talla');
  group?.scrollIntoView({ block: 'center' });
  group?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
}

// Un solo grupo de escuchas en el documento: los bloques se reemplazan y las escuchas no se pierden.
export function initPicker(): void {
  document.addEventListener('change', (event) => {
    const form = (event.target as HTMLElement).closest<HTMLFormElement>('[data-variant-form]');
    if (form) void apply(form);
  });
  document.addEventListener('submit', (event) => {
    const form = (event.target as HTMLElement).closest<HTMLFormElement>('[data-variant-form]');
    if (!form) return;
    event.preventDefault();
    void apply(form);
  });
  document.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('[data-pick-size]')) focusSizes(event);
  });
}
