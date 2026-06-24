import { useEffect, useMemo, useState } from 'react';
import { loadStored, saveStored } from '../../lib/storage';
import { normalizeDiceSettings, pushDiceHistory, rollDice, type DiceRoll, type DiceSettings } from './diceLogic';

const SETTINGS_KEY = 'bgh:dice:settings';
const HISTORY_KEY = 'bgh:dice:history';
const quickSides = [4, 6, 8, 10, 12, 20];

export function DiceTool() {
  const [settings, setSettings] = useState<DiceSettings>(() => loadStored(SETTINGS_KEY, { count: 2, sides: 6 }));
  const [history, setHistory] = useState<DiceRoll[]>(() => loadStored(HISTORY_KEY, []));
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(history[0] ?? null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingSeed, setRollingSeed] = useState(0);
  const normalized = useMemo(() => normalizeDiceSettings(settings), [settings]);

  useEffect(() => saveStored(SETTINGS_KEY, normalized), [normalized]);
  useEffect(() => saveStored(HISTORY_KEY, history), [history]);
  useEffect(() => {
    if (!isRolling) return undefined;
    const id = window.setInterval(() => setRollingSeed((seed) => seed + 1), 80);
    return () => window.clearInterval(id);
  }, [isRolling]);

  function updateSetting(key: keyof DiceSettings, value: string) {
    setSettings((prev) => normalizeDiceSettings({ ...prev, [key]: Number(value) }));
  }

  function handleRoll() {
    setIsRolling(true);
    window.setTimeout(() => {
      const next = rollDice(normalized);
      setCurrentRoll(next);
      setHistory((prev) => pushDiceHistory(prev, next));
      setIsRolling(false);
    }, 420);
  }

  const displayValues = isRolling
    ? Array.from({ length: normalized.count }, (_, index) => ((index + rollingSeed) % normalized.sides) + 1)
    : currentRoll?.values ?? [];

  return (
    <main className="tool-screen">
      <section className="panel">
        <h2>주사위 굴리기</h2>
        <div className="form-grid">
          <label>
            주사위 개수
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={settings.count}
              onChange={(event) => updateSetting('count', event.target.value)}
              aria-label="주사위 개수"
            />
          </label>
          <label>
            면 수
            <input
              type="number"
              min="2"
              inputMode="numeric"
              value={settings.sides}
              onChange={(event) => updateSetting('sides', event.target.value)}
              aria-label="주사위 면 수"
            />
          </label>
        </div>
        <div className="chip-row" aria-label="빠른 면 수 선택">
          {quickSides.map((side) => (
            <button
              key={side}
              className={normalized.sides === side ? 'chip active' : 'chip'}
              onClick={() => setSettings((prev) => ({ ...prev, sides: side }))}
              aria-label={`D${side} 선택`}
            >
              D{side}
            </button>
          ))}
        </div>
        <button className="primary-button" onClick={handleRoll} disabled={isRolling} aria-label="주사위 굴리기">
          {isRolling ? '굴리는 중...' : '굴리기'}
        </button>
      </section>

      <section className="panel result-panel" aria-live="polite">
        <h3>결과</h3>
        <div className={isRolling ? 'dice-results rolling' : 'dice-results'}>
          {displayValues.length > 0 ? displayValues.map((value, index) => <span key={`${index}-${value}`}>{value}</span>) : <em>아직 결과 없음</em>}
        </div>
        <strong className="large-result">합계 {currentRoll?.total ?? 0}</strong>
      </section>

      <section className="panel">
        <div className="section-title">
          <h3>최근 기록</h3>
          <button className="ghost-button" onClick={() => setHistory([])} aria-label="주사위 기록 초기화">
            초기화
          </button>
        </div>
        <ol className="history-list">
          {history.map((roll) => (
            <li key={roll.id}>
              {roll.count}D{roll.sides}: {roll.values.join(', ')} <strong>{roll.total}</strong>
            </li>
          ))}
          {history.length === 0 && <li>기록이 없습니다.</li>}
        </ol>
      </section>
    </main>
  );
}
