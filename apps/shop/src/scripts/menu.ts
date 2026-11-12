// Menú lateral del teléfono: abre y cierra el <dialog>. Se cierra con la X, al tocar fuera del panel,
// con Esc (lo hace el navegador) y al elegir un enlace.
export function initMenu(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#menu');
  if (!dialog) return;
  document
    .querySelectorAll('[data-menu-open]')
    .forEach((button) => button.addEventListener('click', () => dialog.showModal()));
  dialog.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const closes = target === dialog || target.closest('[data-menu-close]') || target.closest('a');
    if (closes) dialog.close();
  });
}
