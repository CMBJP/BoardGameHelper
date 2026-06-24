import { secureRandomInt, type RandomSource } from '../../lib/random';

export interface SpinPlan {
  winnerIndex: number;
  rotation: number;
}

export function cleanWheelItems(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

export function canSpin(items: string[]): boolean {
  return cleanWheelItems(items).length >= 2;
}

export function createSpinPlan(itemCount: number, randomInt: RandomSource = secureRandomInt): SpinPlan {
  if (itemCount < 2) throw new Error('항목은 최소 2개 이상이어야 합니다.');
  const winnerIndex = randomInt(itemCount);
  const slice = 360 / itemCount;
  const pointerAngle = 270;
  const targetCenter = winnerIndex * slice + slice / 2;
  const extraTurns = 5 + randomInt(3);
  const rotation = extraTurns * 360 + pointerAngle - targetCenter;
  return { winnerIndex, rotation };
}

export function truncateWheelLabel(label: string, max = 12): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}
