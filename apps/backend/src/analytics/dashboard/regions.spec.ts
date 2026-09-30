import { BadRequestException } from '@nestjs/common';
import { countriesOfMacro, macroForCountry, resolveRegionScope } from './regions';

describe('region scopes', () => {
  it('global (default / any case) has no country filter', () => {
    for (const v of [undefined, null, '', 'global', 'GLOBAL']) {
      expect(resolveRegionScope(v)).toMatchObject({ code: 'global', kind: 'global', countries: null });
    }
  });

  it('macro-regions expand to their countries', () => {
    const s = resolveRegionScope('apac');
    expect(s).toMatchObject({ code: 'APAC', name: 'Asia-Pacific', kind: 'macro' });
    expect(s.countries).toEqual(countriesOfMacro('APAC'));
    expect(s.countries).toContain('IN');
  });

  it('countries resolve with their parent macro (unknown ISO codes still scope)', () => {
    expect(resolveRegionScope('us')).toEqual({ code: 'US', name: 'United States', kind: 'country', macro: 'NA', countries: ['US'] });
    expect(resolveRegionScope('ZZ')).toEqual({ code: 'ZZ', name: 'ZZ', kind: 'country', macro: null, countries: ['ZZ'] });
    expect(macroForCountry('gb')).toBe('EU');
    expect(macroForCountry(null)).toBeNull();
  });

  it('rejects anything else', () => {
    expect(() => resolveRegionScope('NOWHERE')).toThrow(BadRequestException);
    expect(() => resolveRegionScope('U1')).toThrow(BadRequestException);
  });
});
