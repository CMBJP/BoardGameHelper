export interface TimerPlayer {
  id: string;
  name: string;
  remainingMs: number;
  expired: boolean;
}

export interface TimerConfig {
  names: string[];
  minutesPerPlayer: number;
  unlimited: boolean;
  vibrate: boolean;
  sound: boolean;
}

export interface TimerState {
  players: TimerPlayer[];
  activeIndex: number;
  turnCount: number;
  running: boolean;
  unlimited: boolean;
  lastTick: number;
  history: number[];
}

export function normalizeTimerConfig(config: TimerConfig): TimerConfig {
  const names = config.names.map((name, index) => name.trim() || `참가자 ${index + 1}`).slice(0, 12);
  while (names.length < 2) names.push(`참가자 ${names.length + 1}`);
  return {
    names,
    minutesPerPlayer: Math.max(1, Math.round(config.minutesPerPlayer || 1)),
    unlimited: config.unlimited,
    vibrate: config.vibrate,
    sound: config.sound
  };
}

export function createTimerState(config: TimerConfig, now = Date.now()): TimerState {
  const normalized = normalizeTimerConfig(config);
  const duration = normalized.minutesPerPlayer * 60_000;
  return {
    players: normalized.names.map((name, index) => ({
      id: `${index}-${name}`,
      name,
      remainingMs: duration,
      expired: false
    })),
    activeIndex: 0,
    turnCount: 1,
    running: false,
    unlimited: normalized.unlimited,
    lastTick: now,
    history: []
  };
}

export function tickTimer(state: TimerState, now = Date.now()): TimerState {
  if (!state.running || state.unlimited) return { ...state, lastTick: now };
  const elapsed = Math.max(0, now - state.lastTick);
  const players = state.players.map((player, index) => {
    if (index !== state.activeIndex) return player;
    const remainingMs = Math.max(0, player.remainingMs - elapsed);
    return { ...player, remainingMs, expired: remainingMs === 0 };
  });
  return { ...state, players, running: players[state.activeIndex].remainingMs > 0, lastTick: now };
}

export function nextTurn(state: TimerState, now = Date.now()): TimerState {
  const activeIndex = (state.activeIndex + 1) % state.players.length;
  return {
    ...state,
    activeIndex,
    turnCount: state.turnCount + 1,
    lastTick: now,
    history: [...state.history, state.activeIndex].slice(-40)
  };
}

export function undoTurn(state: TimerState, now = Date.now()): TimerState {
  const previous = state.history.at(-1);
  if (previous === undefined) return state;
  return {
    ...state,
    activeIndex: previous,
    turnCount: Math.max(1, state.turnCount - 1),
    lastTick: now,
    history: state.history.slice(0, -1)
  };
}
