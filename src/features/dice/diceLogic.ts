import { secureRandomInt, type RandomSource } from '../../lib/random';
import { clampInteger } from '../../lib/time';

export interface DiceSettings {
  count: number;
  sides: number;
}

export interface DiceRoll {
  id: string;
  count: number;
  sides: number;
  values: number[];
  total: number;
  rolledAt: number;
}

export function normalizeDiceSettings(settings: DiceSettings): DiceSettings {
  return {
    count: clampInteger(settings.count, 1, 99),
    sides: clampInteger(settings.sides, 2, 999)
  };
}

export function rollDice(settings: DiceSettings, randomInt: RandomSource = secureRandomInt): DiceRoll {
  const normalized = normalizeDiceSettings(settings);
  const values = Array.from({ length: normalized.count }, () => randomInt(normalized.sides) + 1);
  return {
    id: `${Date.now()}-${randomInt(1_000_000)}`,
    ...normalized,
    values,
    total: values.reduce((sum, value) => sum + value, 0),
    rolledAt: Date.now()
  };
}

export function pushDiceHistory(history: DiceRoll[], roll: DiceRoll): DiceRoll[] {
  return [roll, ...history].slice(0, 10);
}
