import { describe, expect, it } from 'vitest';
import { selectionUrl } from './picker';

const form = (entries: Record<string, string>): FormData => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

describe('selectionUrl', () => {
  it('arma la URL con la talla y el color elegidos', () => {
    expect(selectionUrl('/p/oxford-clasico', form({ talla: '39', color: 'Verde musgo' }))).toBe(
      '/p/oxford-clasico?talla=39&color=Verde+musgo'
    );
  });

  it('sin color deja solo la talla, y sin nada deja la ruta limpia', () => {
    expect(selectionUrl('/p/a', form({ talla: '38' }))).toBe('/p/a?talla=38');
    expect(selectionUrl('/p/a', form({}))).toBe('/p/a');
  });

  it('ignora campos ajenos y valores vacíos', () => {
    expect(selectionUrl('/p/a', form({ talla: '', color: 'Negro', otro: 'x' }))).toBe(
      '/p/a?color=Negro'
    );
  });
});
