import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { languageService, SUPPORTED_AFRICAN_LANGUAGES } from '../languageService.ts';
import { ApiError } from '../apiClient.ts';

describe('LanguageService — Pan-African Taxonomy & Translation Engine', () => {
  beforeEach(() => {
    languageService.clearCache();
  });

  describe('getSupportedLanguages & getLanguageByCode', () => {
    it('should return a comprehensive list of supported African languages', async () => {
      const languages = await languageService.getSupportedLanguages();
      assert.ok(Array.isArray(languages));
      assert.ok(languages.length >= 10);

      // Verify core indigenous languages
      const codes = languages.map((l) => l.code);
      assert.ok(codes.includes('yo'), 'Should contain Yoruba (yo)');
      assert.ok(codes.includes('ha'), 'Should contain Hausa (ha)');
      assert.ok(codes.includes('ig'), 'Should contain Igbo (ig)');
      assert.ok(codes.includes('sw'), 'Should contain Swahili (sw)');
      assert.ok(codes.includes('am'), 'Should contain Amharic (am)');
      assert.ok(codes.includes('zu'), 'Should contain Zulu (zu)');
      assert.ok(codes.includes('en'), 'Should contain English (en)');
    });

    it('should correctly resolve a language by its ISO/common code', () => {
      const yoruba = languageService.getLanguageByCode('yo');
      assert.ok(yoruba);
      assert.strictEqual(yoruba.name, 'Yoruba');
      assert.strictEqual(yoruba.nativeName, 'Èdè Yorùbá');
      assert.strictEqual(yoruba.flag, '🇳🇬');

      const swahili = languageService.getLanguageByCode('sw');
      assert.ok(swahili);
      assert.strictEqual(swahili.name, 'Swahili');
      assert.strictEqual(swahili.nativeName, 'Kiswahili');

      const nonexistent = languageService.getLanguageByCode('xx_invalid');
      assert.strictEqual(nonexistent, undefined);
    });
  });

  describe('saveUserLanguagePreferences', () => {
    it('should throw VALIDATION_ERROR (400) if nativeLanguage is empty', async () => {
      await assert.rejects(
        async () => {
          await languageService.saveUserLanguagePreferences({
            nativeLanguage: '',
            preferredLanguage: 'en',
          });
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          assert.strictEqual(err.status, 400);
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if preferredLanguage is empty', async () => {
      await assert.rejects(
        async () => {
          await languageService.saveUserLanguagePreferences({
            nativeLanguage: 'yo',
            preferredLanguage: '',
          });
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          assert.strictEqual(err.status, 400);
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if language code is not supported', async () => {
      await assert.rejects(
        async () => {
          await languageService.saveUserLanguagePreferences({
            nativeLanguage: 'kryptonian',
            preferredLanguage: 'en',
          });
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          assert.ok(err.message.includes('Unsupported native language'));
          return true;
        }
      );
    });

    it('should accept and persist valid African language preferences', async () => {
      const prefs = await languageService.saveUserLanguagePreferences({
        nativeLanguage: 'yo',
        preferredLanguage: 'ha',
        autoTranslateIncoming: true,
        voiceSpeechRate: 1.0,
      });

      assert.strictEqual(prefs.nativeLanguage, 'yo');
      assert.strictEqual(prefs.preferredLanguage, 'ha');
      assert.strictEqual(prefs.autoTranslateIncoming, true);
    });
  });

  describe('translateMessage & In-Memory Caching', () => {
    it('should throw VALIDATION_ERROR (400) if text to translate is empty', async () => {
      await assert.rejects(
        async () => {
          await languageService.translateMessage({
            text: '   ',
            targetLanguage: 'ha',
          });
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if targetLanguage is empty', async () => {
      await assert.rejects(
        async () => {
          await languageService.translateMessage({
            text: 'Hello, African brother',
            targetLanguage: '',
          });
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          return true;
        }
      );
    });

    it('should translate common Pan-African greetings accurately', async () => {
      const resYoruba = await languageService.translateMessage({
        text: 'Hello',
        targetLanguage: 'yo',
      });
      assert.strictEqual(resYoruba.translatedText, 'Bawo ni');
      assert.strictEqual(resYoruba.targetLanguage, 'yo');

      const resHausa = await languageService.translateMessage({
        text: 'Welcome',
        targetLanguage: 'ha',
      });
      assert.strictEqual(resHausa.translatedText, 'Barka da zuwa');

      const resSwahili = await languageService.translateMessage({
        text: 'Thank you',
        targetLanguage: 'sw',
      });
      assert.strictEqual(resSwahili.translatedText, 'Asante sana');
    });

    it('should cache repeated translation requests in memory', async () => {
      const firstCall = await languageService.translateMessage({
        text: 'Community building across Africa',
        targetLanguage: 'yo',
      });

      const secondCall = await languageService.translateMessage({
        text: 'Community building across Africa',
        targetLanguage: 'yo',
      });

      assert.strictEqual(firstCall.translatedText, secondCall.translatedText);
      assert.strictEqual(firstCall, secondCall); // Exact same object reference from memory cache
    });
  });
});
