/**
 * Comparte un texto con la hoja nativa de iOS (WhatsApp, Notas, Mensajes...).
 * Safari maneja mal las descargas de archivos sueltos, así que la descarga queda como respaldo.
 */
export async function shareOrSaveText(title: string, text: string, filename: string) {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text });
      return;
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
