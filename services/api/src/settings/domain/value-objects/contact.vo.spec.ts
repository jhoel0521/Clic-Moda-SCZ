import { InvalidSettingError } from '../errors/settings.errors.js';
import { MapUrl, SocialUrl, WhatsAppNumber } from './contact.vo.js';

describe('WhatsAppNumber', () => {
  it.each(['59171234567', '5491155556666', '1234567890'])('acepta %s', (raw) => {
    expect(WhatsAppNumber.of(raw).value).toBe(raw);
  });

  it.each(['71234567', '+59171234567', '0059171234567', '5917123abcd', '', '5917123456789012'])(
    'rechaza "%s"',
    (raw) => {
      expect(() => WhatsAppNumber.of(raw)).toThrow(InvalidSettingError);
    }
  );
});

describe('SocialUrl', () => {
  it('acepta https del dominio de la red y sus subdominios', () => {
    expect(SocialUrl.of('instagram', 'https://www.instagram.com/clicmoda').value).toBe(
      'https://www.instagram.com/clicmoda'
    );
  });

  it.each([
    ['instagram', 'http://instagram.com/x'],
    ['instagram', 'https://facebook.com/x'],
    ['tiktok', 'https://eviltiktok.com/x'],
    ['facebook', 'https://facebook.com.malo.com/x'],
    ['facebook', 'no es url'],
  ] as const)('rechaza %s con %s', (network, raw) => {
    expect(() => SocialUrl.of(network, raw)).toThrow(InvalidSettingError);
  });
});

describe('MapUrl', () => {
  it('solo https y hasta 300 caracteres', () => {
    expect(MapUrl.of('https://maps.app.goo.gl/abc').value).toContain('https://');
    expect(() => MapUrl.of('http://maps.app.goo.gl/abc')).toThrow(InvalidSettingError);
    expect(() => MapUrl.of(`https://a.com/${'x'.repeat(300)}`)).toThrow(InvalidSettingError);
    expect(() => MapUrl.of('javascript:alert(1)')).toThrow(InvalidSettingError);
  });
});
