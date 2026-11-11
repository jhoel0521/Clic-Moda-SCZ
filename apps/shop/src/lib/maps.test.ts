import { describe, expect, it } from 'vitest';
import { mapEmbedUrl } from './maps';

describe('mapEmbedUrl', () => {
  it('usa tal cual una URL de "Insertar un mapa" de Google', () => {
    const embed = 'https://www.google.com/maps/embed?pb=!1m18!1m12';

    expect(mapEmbedUrl(embed, 'Av. Banzer 123')).toBe(embed);
  });

  it('con un enlace corto (no incrustable) busca la dirección del almacén', () => {
    expect(mapEmbedUrl('https://maps.app.goo.gl/abc', 'Av. Banzer 123, Santa Cruz')).toBe(
      'https://www.google.com/maps?q=Av.%20Banzer%20123%2C%20Santa%20Cruz&output=embed'
    );
  });

  it('sin enlace usable ni dirección no hay mapa', () => {
    expect(mapEmbedUrl(null, '')).toBeNull();
    expect(mapEmbedUrl('https://maps.app.goo.gl/abc', '  ')).toBeNull();
  });

  it('nunca incrusta otros dominios ni http', () => {
    expect(mapEmbedUrl('https://evil.com/maps/embed?x=1', '')).toBeNull();
    expect(mapEmbedUrl('http://www.google.com/maps/embed?x=1', '')).toBeNull();
  });
});
