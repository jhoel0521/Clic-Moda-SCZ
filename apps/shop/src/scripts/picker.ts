// Mejora progresiva del selector de talla y color: la elección vive en la URL (?talla=38&color=Negro), así que
// aplicarla es enviar el formulario GET. Se conserva la posición de la página y el ancla "Elige tu talla"
// mueve el foco al selector.
const KEY = 'picker-scroll';

function restoreScroll(): void {
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved === null) return;
    sessionStorage.removeItem(KEY);
    window.scrollTo(0, Number(saved));
  } catch {
    /* sin sessionStorage: la página simplemente empieza arriba */
  }
}

function rememberScroll(): void {
  try {
    sessionStorage.setItem(KEY, String(window.scrollY));
  } catch {
    /* igual */
  }
}

function focusSizes(event: Event): void {
  event.preventDefault();
  const group = document.getElementById('talla');
  group?.scrollIntoView({ block: 'center' });
  group?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
}

export function initPicker(): void {
  const form = document.querySelector<HTMLFormElement>('[data-variant-form]');
  form?.addEventListener('change', () => {
    rememberScroll();
    form.requestSubmit();
  });
  document
    .querySelectorAll('[data-pick-size]')
    .forEach((link) => link.addEventListener('click', focusSizes));
  restoreScroll();
}
