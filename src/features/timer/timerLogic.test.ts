import { describe, expect, it } from 'vitest';
import { createTimerState, nextTurn, tickTimer, undoTurn } from './timerLogic';

describe('timer logic', () => {
  it('decreases only active player by elapsed Date.now time', () => {
    const state = { ...createTimerState({ names: ['a', 'b'], minutesPerPlayer: 1, unlimited: false, vibrate: false, sound: false }, 1000), running: true };
    const next = tickTimer(state, 11_000);
    expect(next.players[0].remainingMs).toBe(50_000);
    expect(next.players[1].remainingMs).toBe(60_000);
  });

  it('moves and undoes turns', () => {
    const state = createTimerState({ names: ['a', 'b'], minutesPerPlayer: 1, unlimited: true, vibrate: false, sound: false }, 0);
    const moved = nextTurn(state, 10);
    expect(moved.activeIndex).toBe(1);
    expect(undoTurn(moved, 20).activeIndex).toBe(0);
  });
});
