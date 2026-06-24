import { secureRandomInt, shuffle, type RandomSource } from '../../lib/random';

export interface LadderRung {
  row: number;
  from: number;
}

export interface LadderGame {
  participants: string[];
  results: string[];
  assignments: number[];
  rungs: LadderRung[];
  rows: number;
}

export function cleanNames(names: string[]): string[] {
  return names.map((name) => name.trim()).filter(Boolean);
}

export function canStartLadder(participants: string[], results: string[]): boolean {
  const cleanParticipants = cleanNames(participants);
  const cleanResults = cleanNames(results);
  return cleanParticipants.length >= 2 && cleanParticipants.length === cleanResults.length;
}

export function createLadderGame(participants: string[], results: string[], randomInt: RandomSource = secureRandomInt): LadderGame {
  const cleanParticipants = cleanNames(participants);
  const cleanResults = cleanNames(results);
  if (!canStartLadder(cleanParticipants, cleanResults)) {
    throw new Error('참가자와 결과는 2개 이상이며 개수가 같아야 합니다.');
  }

  const rows = Math.max(5, cleanParticipants.length * 3);
  const rungs: LadderRung[] = [];
  for (let row = 0; row < rows; row += 1) {
    let col = 0;
    while (col < cleanParticipants.length - 1) {
      const previousConnected = rungs.some((rung) => rung.row === row && rung.from === col - 1);
      if (!previousConnected && randomInt(100) < 36) {
        rungs.push({ row, from: col });
        col += 2;
      } else {
        col += 1;
      }
    }
  }

  const shuffledResults = shuffle(
    cleanResults.map((_, index) => index),
    randomInt,
  );

  return {
    participants: cleanParticipants,
    results: cleanResults,
    assignments: cleanParticipants.map((_, participantIndex) => shuffledResults[traceLadder(participantIndex, rungs, rows)]),
    rungs,
    rows
  };
}

export function traceLadder(startIndex: number, rungs: LadderRung[], rows: number): number {
  let col = startIndex;
  for (let row = 0; row < rows; row += 1) {
    const right = rungs.find((rung) => rung.row === row && rung.from === col);
    const left = rungs.find((rung) => rung.row === row && rung.from === col - 1);
    if (right) col += 1;
    else if (left) col -= 1;
  }
  return col;
}
