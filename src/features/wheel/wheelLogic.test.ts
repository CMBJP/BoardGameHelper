import { describe, expect, it } from 'vitest';
import { canSpin, createSpinPlan, truncateWheelLabel } from './wheelLogic';

describe('wheel logic', () => {
  it('requires at least two non-empty items', () => {
    expect(canSpin(['a', ''])).toBe(false);
    expect(canSpin(['a', 'b'])).toBe(true);
  });

  it('creates deterministic spin plan', () => {
    const plan = createSpinPlan(4, () => 1);
    expect(plan.winnerIndex).toBe(1);
    expect(plan.rotation).toBeGreaterThan(360);
  });

  it('truncates long labels', () => {
    expect(truncateWheelLabel('abcdefghijklmnop', 6)).toBe('abcde…');
  });
});
