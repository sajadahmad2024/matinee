import { addDays, daysBetween, mergeCoverage } from './coverage';

describe('rollup coverage', () => {
  const today = '2026-09-25';
  const empty = { coveredFrom: null, coveredThrough: null };

  it('date helpers', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-09-01', '2026-09-25')).toBe(24);
  });

  it('only closed days (≤ yesterday) count as covered', () => {
    expect(mergeCoverage(empty, '2026-09-24', '2026-09-25', today)).toEqual({ coveredFrom: '2026-09-24', coveredThrough: '2026-09-24' });
    expect(mergeCoverage(empty, '2026-09-25', '2026-09-25', today)).toEqual(empty);
  });

  it('merges contiguous / overlapping runs', () => {
    const cur = { coveredFrom: '2026-09-10', coveredThrough: '2026-09-20' };
    expect(mergeCoverage(cur, '2026-09-21', '2026-09-25', today)).toEqual({ coveredFrom: '2026-09-10', coveredThrough: '2026-09-24' });
    expect(mergeCoverage(cur, '2026-09-01', '2026-09-09', today)).toEqual({ coveredFrom: '2026-09-01', coveredThrough: '2026-09-20' });
    expect(mergeCoverage(cur, '2026-09-12', '2026-09-15', today)).toEqual(cur);
  });

  it('a disjoint newer run replaces; a disjoint older run is ignored', () => {
    const cur = { coveredFrom: '2026-09-01', coveredThrough: '2026-09-05' };
    expect(mergeCoverage(cur, '2026-09-20', '2026-09-25', today)).toEqual({ coveredFrom: '2026-09-20', coveredThrough: '2026-09-24' });
    const recent = { coveredFrom: '2026-09-20', coveredThrough: '2026-09-24' };
    expect(mergeCoverage(recent, '2026-09-01', '2026-09-05', today)).toEqual(recent);
  });
});
