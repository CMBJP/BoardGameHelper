import { describe, expect, it } from 'vitest';
import { canStartLadder, createLadderGame, traceLadder } from './ladderLogic';

describe('ladder logic', () => {
  it('requires equal counts and at least two participants', () => {
    expect(canStartLadder(['a'], ['x'])).toBe(false);
    expect(canStartLadder(['a', 'b'], ['x'])).toBe(false);
    expect(canStartLadder(['a', 'b'], ['x', 'y'])).toBe(true);
  });

  it('traces horizontal rungs', () => {
    expect(traceLadder(0, [{ row: 0, from: 0 }], 1)).toBe(1);
    expect(traceLadder(1, [{ row: 0, from: 0 }], 1)).toBe(0);
  });

  it('creates hidden assignments for every participant', () => {
    const game = createLadderGame(['a', 'b', 'c'], ['x', 'y', 'z'], () => 0);
    expect(game.assignments).toHaveLength(3);
    expect(new Set(game.assignments).size).toBe(3);
  });
});
