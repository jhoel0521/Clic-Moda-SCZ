import { describe, expect, it } from 'vitest';
import { issuesToErrors, toBody, toForm, validateForm, whatsappLink, type SettingsData } from './settings';

const data: SettingsData = {
  brandName: 'Clic Moda SC',
  tagline: 'Calzado de moda',
  color: { primary: '#c7305a', dark: '#9e2647', light: '#db6988', soft: '#fbeef2', onPrimary: '#ffffff' },
  logo: null,
  seo: {
    title: 'Clic Moda SC · Calzado de moda en Santa Cruz',
    description:
      'Zapatos de moda en Santa Cruz de la Sierra. Mira el catálogo, elige tu talla y cierra tu compra por WhatsApp.',
    shareImage: null,
  },
  contact: { whatsapp: '59171234567', address: '', pickupHours: '', mapUrl: null },
  social: { instagram: null, tiktok: null, facebook: null },
  updatedAt: '2026-11-12T00:00:00.000Z',
};

describe('toForm / toBody', () => {
  it('los opcionales ausentes quedan vacíos en el formulario y vuelven a null al enviar', () => {
    const form = toForm(data);

    expect([form.mapUrl, form.instagram]).toEqual(['', '']);
    expect(toBody(form)).toMatchObject({ mapUrl: null, instagram: null, tiktok: null, facebook: null });
  });

  it('un enlace con espacios se recorta', () => {
    expect(toBody({ ...toForm(data), instagram: ' https://instagram.com/x ' }).instagram).toBe(
      'https://instagram.com/x'
    );
  });
});

describe('validateForm', () => {
  it('los datos de la semilla no tienen avisos', () => {
    expect(validateForm(toForm(data))).toEqual({});
  });

  it('avisa del rango de cada texto y del WhatsApp', () => {
    const errors = validateForm({ ...toForm(data), brandName: 'x', seoDescription: 'corta', whatsapp: '71234567' });

    expect(Object.keys(errors).sort()).toEqual(['brandName', 'seoDescription', 'whatsapp']);
    expect(errors.brandName).toBe('El nombre: entre 2 y 24 caracteres');
  });

  it('un eslogan vacío es válido y uno de 61 caracteres no', () => {
    expect(validateForm({ ...toForm(data), tagline: '' }).tagline).toBeUndefined();
    expect(validateForm({ ...toForm(data), tagline: 'a'.repeat(61) }).tagline).toBe('El eslogan: hasta 60 caracteres');
  });
});

describe('issuesToErrors y enlace de WhatsApp', () => {
  it('conserva el primer mensaje de cada campo', () => {
    const errors = issuesToErrors([
      { field: 'brandName', message: 'uno' },
      { field: 'brandName', message: 'dos' },
    ]);

    expect(errors).toEqual({ brandName: 'uno' });
  });

  it('arma wa.me con el mensaje codificado', () => {
    expect(whatsappLink('59171234567')).toBe('https://wa.me/59171234567');
    expect(whatsappLink('59171234567', 'Hola, quiero la bota')).toBe(
      'https://wa.me/59171234567?text=Hola%2C%20quiero%20la%20bota'
    );
  });
});
