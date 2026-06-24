import { useEffect, useMemo, useState } from 'react';
import { playBeep, vibrate } from '../../lib/feedback';
import { loadStored, removeStored, saveStored } from '../../lib/storage';
import { formatMs } from '../../lib/time';
import { createTimerState, nextTurn, normalizeTimerConfig, tickTimer, undoTurn, type TimerConfig, type TimerState } from './timerLogic';

const CONFIG_KEY = 'bgh:timer:config';
const SESSION_KEY = 'bgh:timer:session';

const defaultConfig: TimerConfig = {
  names: ['플레이어 1', '플레이어 2'],
  minutesPerPlayer: 10,
  unlimited: false,
  vibrate: true,
  sound: false
};

export function TimerTool() {
  const [config, setConfig] = useState<TimerConfig>(() => loadStored(CONFIG_KEY, defaultConfig));
  const [state, setState] = useState<TimerState | null>(null);
  const [restoreState, setRestoreState] = useState<TimerState | null>(() => loadStored<TimerState | null>(SESSION_KEY, null));
  const normalizedConfig = useMemo(() => normalizeTimerConfig(config), [config]);

  useEffect(() => saveStored(CONFIG_KEY, normalizedConfig), [normalizedConfig]);
  useEffect(() => {
    if (state) saveStored(SESSION_KEY, state);
  }, [state]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((prev) => (prev ? tickTimer(prev) : prev));
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  function updateName(index: number, value: string) {
    setConfig((prev) => ({ ...prev, names: prev.names.map((name, nameIndex) => (nameIndex === index ? value : name)) }));
  }

  function startNew() {
    removeStored(SESSION_KEY);
    setRestoreState(null);
    setState(createTimerState(normalizedConfig));
  }

  function passTurn() {
    setState((prev) => {
      if (!prev) return prev;
      const ticked = tickTimer(prev);
      if (normalizedConfig.vibrate) vibrate(45);
      if (normalizedConfig.sound) playBeep();
      return nextTurn(ticked);
    });
  }

  const activePlayer = state?.players[state.activeIndex];

  return (
    <main className="tool-screen">
      {restoreState && !state && (
        <section className="panel restore-panel">
          <h2>이전 타이머가 있습니다</h2>
          <p>자동 재개하지 않았습니다. 이어서 사용할까요?</p>
          <div className="button-row">
            <button className="primary-button" onClick={() => setState({ ...restoreState, running: false, lastTick: Date.now() })} aria-label="이전 타이머 복원">
              복원
            </button>
            <button
              className="ghost-button"
              onClick={() => {
                removeStored(SESSION_KEY);
                setRestoreState(null);
              }}
              aria-label="이전 타이머 버리기"
            >
              버리기
            </button>
          </div>
        </section>
      )}

      <section className="panel">
        <h2>턴 타이머 설정</h2>
        <div className="section-title">
          <h3>참가자</h3>
          <button className="ghost-button" onClick={() => setConfig((prev) => ({ ...prev, names: [...prev.names, `플레이어 ${prev.names.length + 1}`] }))} aria-label="참가자 추가">
            추가
          </button>
        </div>
        {config.names.map((name, index) => (
          <div className="inline-edit" key={index}>
            <input value={name} onChange={(event) => updateName(index, event.target.value)} aria-label={`타이머 참가자 ${index + 1}`} />
            <button className="icon-button" onClick={() => setConfig((prev) => ({ ...prev, names: prev.names.filter((_, itemIndex) => itemIndex !== index) }))} disabled={config.names.length <= 2} aria-label={`타이머 참가자 ${index + 1} 삭제`}>
              ×
            </button>
          </div>
        ))}
        <label className="checkbox-row">
          <input type="checkbox" checked={config.unlimited} onChange={(event) => setConfig((prev) => ({ ...prev, unlimited: event.target.checked }))} />
          제한 시간 없이 턴만 표시
        </label>
        {!config.unlimited && (
          <label>
            참가자별 제한 시간(분)
            <input type="number" min="1" inputMode="numeric" value={config.minutesPerPlayer} onChange={(event) => setConfig((prev) => ({ ...prev, minutesPerPlayer: Number(event.target.value) }))} aria-label="참가자별 제한 시간 분" />
          </label>
        )}
        <label className="checkbox-row">
          <input type="checkbox" checked={config.vibrate} onChange={(event) => setConfig((prev) => ({ ...prev, vibrate: event.target.checked }))} />
          턴 전환 시 진동
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={config.sound} onChange={(event) => setConfig((prev) => ({ ...prev, sound: event.target.checked }))} />
          턴 전환 시 효과음
        </label>
        <button className="primary-button" onClick={startNew} aria-label="새 턴 타이머 시작">
          새 타이머 시작
        </button>
      </section>

      {state && activePlayer && (
        <section className={activePlayer.expired ? 'timer-board expired' : 'timer-board'}>
          <button className="turn-touch" onClick={passTurn} aria-label={`${activePlayer.name} 턴 종료하고 다음 참가자로 넘기기`}>
            <span>{state.turnCount}번째 턴</span>
            <strong>{activePlayer.name}</strong>
            <em>{state.unlimited ? '시간 제한 없음' : formatMs(activePlayer.remainingMs)}</em>
            {activePlayer.expired && <b>시간 종료</b>}
          </button>
          <div className="timer-controls">
            <button className="secondary-button" onClick={() => setState((prev) => (prev ? { ...prev, running: !prev.running, lastTick: Date.now() } : prev))} aria-label={state.running ? '타이머 일시정지' : '타이머 다시 시작'}>
              {state.running ? '일시정지' : '다시 시작'}
            </button>
            <button className="ghost-button" onClick={() => setState((prev) => (prev ? undoTurn(prev) : prev))} disabled={state.history.length === 0} aria-label="이전 턴으로 되돌리기">
              이전 턴
            </button>
            <button className="ghost-button" onClick={startNew} aria-label="타이머 초기화">
              초기화
            </button>
          </div>
          <div className="player-strip">
            {state.players.map((player, index) => (
              <div key={player.id} className={index === state.activeIndex ? 'player-chip active' : player.expired ? 'player-chip expired' : 'player-chip'}>
                <span>{player.name}</span>
                <strong>{state.unlimited ? '-' : formatMs(player.remainingMs)}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
