import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  taxonomyService,
  AFRICAN_COUNTRIES,
  AFRICAN_REGIONS,
} from '../taxonomyService.ts';

describe('TaxonomyService — Full 54-Country Pan-African Taxonomy & Languages', () => {
  it('should contain exactly 54 African countries', async () => {
    const countries = await taxonomyService.getCountries();
    assert.strictEqual(countries.length, 54, 'Must contain all 54 African countries');
    assert.strictEqual(AFRICAN_COUNTRIES.length, 54);
  });

  it('should verify every country has all required fields including exactly 3 major languages', () => {
    for (const country of AFRICAN_COUNTRIES) {
      assert.ok(country.id, `Country ${country.name} must have an id`);
      assert.ok(country.code && country.code.length === 2, `Country ${country.name} must have a 2-letter ISO code`);
      assert.ok(country.name, `Country must have a name`);
      assert.ok(country.capital, `Country ${country.name} must have a capital`);
      assert.ok(country.population, `Country ${country.name} must have population info`);
      assert.ok(country.region, `Country ${country.name} must have a valid region`);
      assert.ok(AFRICAN_REGIONS.includes(country.region), `Country ${country.name} region must be one of AFRICAN_REGIONS`);
      assert.ok(country.flagEmoji, `Country ${country.name} must have flagEmoji`);
      assert.ok(country.flag, `Country ${country.name} must have flag for backward compatibility`);
      assert.ok(country.description && country.description.length > 20, `Country ${country.name} must have a description`);
      
      // Contract: majorLanguages must be an array of EXACTLY 3 strings
      assert.ok(Array.isArray(country.majorLanguages), `Country ${country.name} majorLanguages must be an array`);
      assert.strictEqual(
        country.majorLanguages.length,
        3,
        `Country ${country.name} must have exactly 3 major languages, got ${country.majorLanguages.length}`
      );
      for (const lang of country.majorLanguages) {
        assert.ok(typeof lang === 'string' && lang.trim().length > 0, `Country ${country.name} language must be non-empty string`);
      }
    }
  });

  it('should verify the 5 geopolitical regional distributions (16 West, 15 East, 10 Southern, 5 North, 8 Central = 54)', () => {
    const west = taxonomyService.getCountriesByRegion('West Africa');
    const east = taxonomyService.getCountriesByRegion('East Africa');
    const southern = taxonomyService.getCountriesByRegion('Southern Africa');
    const north = taxonomyService.getCountriesByRegion('North Africa');
    const central = taxonomyService.getCountriesByRegion('Central Africa');

    assert.strictEqual(west.length, 16, 'West Africa must have 16 nations');
    assert.strictEqual(east.length, 15, 'East Africa must have 15 nations');
    assert.strictEqual(southern.length, 10, 'Southern Africa must have 10 nations');
    assert.strictEqual(north.length, 5, 'North Africa must have 5 nations');
    assert.strictEqual(central.length, 8, 'Central Africa must have 8 nations');

    assert.strictEqual(west.length + east.length + southern.length + north.length + central.length, 54);
  });

  it('should resolve country by code or id case-insensitively', () => {
    const nigeria = taxonomyService.getCountryByCode('ng');
    assert.ok(nigeria);
    assert.strictEqual(nigeria.name, 'Nigeria');
    assert.deepStrictEqual(nigeria.majorLanguages, ['Yoruba', 'Hausa', 'Igbo']);

    const kenya = taxonomyService.getCountryByCode('KE');
    assert.ok(kenya);
    assert.strictEqual(kenya.name, 'Kenya');
    assert.deepStrictEqual(kenya.majorLanguages, ['Swahili', 'Kikuyu', 'Luo']);

    const southAfrica = taxonomyService.getCountryByCode('za');
    assert.ok(southAfrica);
    assert.strictEqual(southAfrica.name, 'South Africa');
    assert.deepStrictEqual(southAfrica.majorLanguages, ['isiZulu', 'isiXhosa', 'Afrikaans']);

    const nonExistent = taxonomyService.getCountryByCode('ZZ');
    assert.strictEqual(nonExistent, undefined);
  });

  it('should fetch and update interests safely', async () => {
    const interests = await taxonomyService.getInterests();
    assert.ok(Array.isArray(interests));
    assert.ok(interests.length >= 10);

    const updated = await taxonomyService.updateUserInterests(['Technology & Startups', 'Afrobeats & Amapiano Music']);
    assert.deepStrictEqual(updated, ['Technology & Startups', 'Afrobeats & Amapiano Music']);
  });
});
