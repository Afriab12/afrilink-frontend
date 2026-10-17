import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  hashString,
  getAvatarHue,
  getAvatarGradient,
  getAvatarGradientStyle,
  getInitials,
} from '../avatar-gradient.ts';

describe('Avatar Gradient & Initials Utilities (Phase 0 Strategy)', () => {
  it('hashString should produce deterministic, positive 32-bit integers', () => {
    const hash1 = hashString('amara_okafor');
    const hash2 = hashString('amara_okafor');
    const hashOther = hashString('kwame_mensah');

    assert.strictEqual(hash1, hash2, 'Identical strings must hash to identical integers');
    assert.notStrictEqual(hash1, hashOther, 'Different strings should produce distinct hashes');
    assert.ok(hash1 >= 0, 'Hash must be non-negative');
    assert.strictEqual(hashString(''), 0, 'Empty string must hash to 0');
  });

  it('getAvatarHue should return an integer in the range [0, 359]', () => {
    const usernames = ['amara', 'kwame', 'zainab', 'chidi', 'tendai', 'fatoumata', '', '12345'];
    for (const u of usernames) {
      const hue = getAvatarHue(u);
      assert.ok(hue >= 0 && hue < 360, `Hue for ${u} must be between 0 and 359 inclusive`);
      assert.strictEqual(Number.isInteger(hue), true, 'Hue must be an integer');
    }
  });

  it('getAvatarGradient should produce the required HSL linear gradient formula', () => {
    const gradient = getAvatarGradient('amara_okafor');
    const hue = getAvatarHue('amara_okafor');
    const expectedSecondHue = (hue + 40) % 360;

    assert.ok(gradient.startsWith('linear-gradient(135deg,'), 'Gradient must start with 135deg');
    assert.ok(gradient.includes(`hsl(${hue}, 45%, 35%)`), `Gradient must contain primary hsl(${hue}, 45%, 35%)`);
    assert.ok(gradient.includes(`hsl(${expectedSecondHue}, 50%, 25%)`), `Gradient must contain secondary hsl(${expectedSecondHue}, 50%, 25%)`);
  });

  it('getAvatarGradientStyle should return CSSProperties with --h and background', () => {
    const style = getAvatarGradientStyle('amara_okafor') as any;
    const hue = getAvatarHue('amara_okafor');

    assert.strictEqual(style['--h'], `${hue}`, 'Style must set CSS variable --h');
    assert.ok(typeof style.background === 'string', 'Style must contain background string');
    assert.ok(style.background.includes(`hsl(${hue}, 45%, 35%)`));
  });

  it('getInitials should extract two-letter uppercase initials', () => {
    // Two-word names
    assert.strictEqual(getInitials('Amara Okafor'), 'AO');
    assert.strictEqual(getInitials('Kwame Mensah'), 'KM');

    // Single-word names -> first two letters uppercase
    assert.strictEqual(getInitials('Kwame'), 'KW');
    assert.strictEqual(getInitials('Zainab'), 'ZA');

    // Multi-word names -> first and last word initials
    assert.strictEqual(getInitials('Amara Ngozi Okafor'), 'AO');
    assert.strictEqual(getInitials('Kofi Ababio Annan'), 'KA');

    // Case insensitivity
    assert.strictEqual(getInitials('fatoumata diallo'), 'FD');

    // Fallback cases
    assert.strictEqual(getInitials(''), 'AL');
    assert.strictEqual(getInitials('   '), 'AL');
    assert.strictEqual(getInitials(null), 'AL');
    assert.strictEqual(getInitials(undefined), 'AL');
    assert.strictEqual(getInitials('', 'NA'), 'NA');
  });
});
