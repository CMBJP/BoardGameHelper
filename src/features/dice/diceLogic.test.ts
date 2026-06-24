import { describe, expect, it } from 'vitest';
import { normalizeDiceSettings, pushDiceHistory, rollDice, type DiceRoll } from './diceLogic';

describe('dice logic', () => {
  it('normalizes invalid settings', () => {
    expect(normalizeDiceSettings({ count: -4, sides: 1 })).toEqual({ count: 1, sides: 2 });
  });

  it('rolls requested dice and sums them', () => {
    const roll = rollDice({ count: 3, sides: 6 }, () => 2);
    expect(roll.values).toEqual([3, 3, 3]);
    expect(roll.total).toBe(9);
  });

  it('keeps only ten history entries', () => {
    const history = Array.from({ length: 10 }, (_, index): DiceRoll => ({
      id: String(index),
      count: 1,
      sides: 6,
      values: [index + 1],
      total: index + 1,
      rolledAt: index
    }));
    expect(pushDiceHistory(history, history[0])).toHaveLength(10);
  });
});
