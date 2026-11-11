import { describe, expect, it, vi } from 'vitest';
import {
  FALLBACK_SETTINGS,
  RETRY_AFTER_MS,
  SETTINGS_TTL_MS,
  createSettingsStore,
  type StoreSettings,
} from './settings';
import { hasWhatsapp, whatsappLink } from './whatsapp';

const named = (brandName: string): StoreSettings => ({ ...FALLBACK_SETTINGS, brandName });

function world(initial: StoreSettings) {
  const clock = { t: 1_000_000 };
  const state = { current: initial, failing: false };
  const load = vi.fn(() =>
    state.failing ? Promise.reject(new Error('API caída')) : Promise.resolve(state.current)
  );
  const store = createSettingsStore({ load, now: () => clock.t });
  return { clock, state, load, store };
}

describe('caché de la configuración', () => {
  it('dentro de 15 s no vuelve a pedirla a la API', async () => {
    const { store, load, clock } = world(named('Uno'));

    await store.get();
    clock.t += SETTINGS_TTL_MS - 1;
    await store.get();

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('un cambio guardado se ve antes de 60 s aunque la API también cachee 15 s', async () => {
    const { store, state, clock } = world(named('Uno'));
    await store.get();

    state.current = named('Dos'); // el Gerente guarda
    clock.t += 15_000 + SETTINGS_TTL_MS; // peor caso: caché HTTP de la API + caché de la tienda

    expect((await store.get()).brandName).toBe('Dos');
    expect(15_000 + SETTINGS_TTL_MS).toBeLessThan(60_000);
  });
});

describe('respaldo ante fallos', () => {
  it('si la API falla entrega el último valor válido y reintenta a los 5 s, no en cada petición', async () => {
    const { store, state, load, clock } = world(named('Uno'));
    await store.get();
    state.failing = true;
    clock.t += SETTINGS_TTL_MS;

    expect((await store.get()).brandName).toBe('Uno');
    await store.get();
    expect(load).toHaveBeenCalledTimes(2);
    clock.t += RETRY_AFTER_MS;
    await store.get();
    expect(load).toHaveBeenCalledTimes(3);
  });
});

describe('respaldo cuando nunca hubo un valor', () => {
  it('si nunca hubo un valor usa el respaldo con la marca provisional y sin WhatsApp', async () => {
    const { store, state } = world(named('Uno'));
    state.failing = true;

    const settings = await store.get();

    expect([settings.brandName, settings.contact.whatsapp]).toEqual(['Clic Moda SC', '']);
  });

  it('cuando la API vuelve, deja de usar el respaldo', async () => {
    const { store, state, clock } = world(named('Uno'));
    state.failing = true;
    await store.get();

    state.failing = false;
    clock.t += RETRY_AFTER_MS;

    expect((await store.get()).brandName).toBe('Uno');
  });
});

describe('enlaces de WhatsApp', () => {
  it('arman wa.me solo con el número de la configuración', () => {
    expect(whatsappLink('59171234567')).toBe('https://wa.me/59171234567');
    expect(whatsappLink('59171234567', 'Hola, ¿tienen talla 38?')).toBe(
      'https://wa.me/59171234567?text=Hola%2C%20%C2%BFtienen%20talla%2038%3F'
    );
  });

  it('el botón solo se ofrece con un número válido', () => {
    expect([hasWhatsapp('59171234567'), hasWhatsapp(''), hasWhatsapp('71234567')]).toEqual([
      true,
      false,
      false,
    ]);
  });
});
