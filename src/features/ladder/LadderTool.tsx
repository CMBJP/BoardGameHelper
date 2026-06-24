import { useEffect, useMemo, useState } from 'react';
import { loadStored, saveStored } from '../../lib/storage';
import { canStartLadder, createLadderGame, type LadderGame } from './ladderLogic';

const PARTICIPANTS_KEY = 'bgh:ladder:participants';
const RESULTS_KEY = 'bgh:ladder:results';

export function LadderTool() {
  const [participants, setParticipants] = useState<string[]>(() => loadStored(PARTICIPANTS_KEY, ['철수', '영희', '민수']));
  const [results, setResults] = useState<string[]>(() => loadStored(RESULTS_KEY, ['설거지', '간식 사기', '면제']));
  const [game, setGame] = useState<LadderGame | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const canStart = useMemo(() => canStartLadder(participants, results), [participants, results]);

  useEffect(() => saveStored(PARTICIPANTS_KEY, participants), [participants]);
  useEffect(() => saveStored(RESULTS_KEY, results), [results]);

  function updateList(list: string[], setter: (value: string[]) => void, index: number, value: string) {
    setter(list.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function removeListItem(list: string[], setter: (value: string[]) => void, index: number) {
    setter(list.filter((_, itemIndex) => itemIndex !== index));
    setGame(null);
  }

  function start() {
    const next = createLadderGame(participants, results);
    setGame(next);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <main className="tool-screen">
      <section className="panel">
        <h2>사다리타기</h2>
        <div className="dual-list">
          <NameList title="참가자" items={participants} onAdd={() => setParticipants([...participants, ''])} onRemove={(index) => removeListItem(participants, setParticipants, index)} onChange={(index, value) => updateList(participants, setParticipants, index, value)} />
          <NameList title="결과" items={results} onAdd={() => setResults([...results, ''])} onRemove={(index) => removeListItem(results, setResults, index)} onChange={(index, value) => updateList(results, setResults, index, value)} />
        </div>
        {!canStart && <p className="notice">참가자와 결과는 각각 2개 이상, 같은 개수여야 합니다.</p>}
        <button className="primary-button" onClick={start} disabled={!canStart} aria-label="사다리 시작">
          시작
        </button>
      </section>

      {game && (
        <section className="panel">
          <div className="section-title">
            <h3>사다리</h3>
            <button className="ghost-button" onClick={start} aria-label="사다리 다시 만들기">
              다시 만들기
            </button>
          </div>
          <div className="ladder-names">
            {game.participants.map((name, index) => (
              <button key={name} className={selected === index ? 'name-pill active' : 'name-pill'} onClick={() => setSelected(index)} aria-label={`${name} 경로 보기`}>
                {name}
              </button>
            ))}
          </div>
          <LadderSvg game={game} selected={selected} />
          <button className="secondary-button" onClick={() => setRevealed(true)} aria-label="전체 결과 공개">
            전체 결과 공개
          </button>
          <div className="result-list" aria-live="polite">
            {game.participants.map((participant, index) => (
              <div key={participant}>
                <span>{participant}</span>
                <strong>{revealed ? game.results[game.assignments[index]] : '숨김'}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

interface NameListProps {
  title: string;
  items: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
}

function NameList({ title, items, onAdd, onRemove, onChange }: NameListProps) {
  return (
    <div className="name-list">
      <div className="section-title">
        <h3>{title}</h3>
        <button className="ghost-button" onClick={onAdd} aria-label={`${title} 추가`}>
          추가
        </button>
      </div>
      {items.map((item, index) => (
        <div className="inline-edit" key={`${title}-${index}`}>
          <input value={item} onChange={(event) => onChange(index, event.target.value)} aria-label={`${title} ${index + 1}`} />
          <button className="icon-button" onClick={() => onRemove(index)} aria-label={`${title} ${index + 1} 삭제`}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function LadderSvg({ game, selected }: { game: LadderGame; selected: number | null }) {
  const width = 320;
  const height = 360;
  const top = 24;
  const bottom = 336;
  const gap = width / (game.participants.length + 1);
  const rowGap = (bottom - top) / game.rows;

  const selectedPath = selected === null ? '' : buildPath(selected, game.rungs, game.rows, gap, top, rowGap);

  return (
    <svg className="ladder-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="무작위 사다리 그림">
      {game.participants.map((_, index) => {
        const x = gap * (index + 1);
        return <line key={index} x1={x} y1={top} x2={x} y2={bottom} className="ladder-line" />;
      })}
      {game.rungs.map((rung, index) => {
        const y = top + rowGap * (rung.row + 0.5);
        return <line key={index} x1={gap * (rung.from + 1)} y1={y} x2={gap * (rung.from + 2)} y2={y} className="ladder-rung" />;
      })}
      {selectedPath && <path d={selectedPath} className="ladder-path" />}
    </svg>
  );
}

function buildPath(start: number, rungs: LadderGame['rungs'], rows: number, gap: number, top: number, rowGap: number): string {
  let col = start;
  let path = `M ${gap * (col + 1)} ${top}`;
  for (let row = 0; row < rows; row += 1) {
    const y = top + rowGap * (row + 0.5);
    path += ` L ${gap * (col + 1)} ${y}`;
    const right = rungs.find((rung) => rung.row === row && rung.from === col);
    const left = rungs.find((rung) => rung.row === row && rung.from === col - 1);
    if (right) col += 1;
    else if (left) col -= 1;
    path += ` L ${gap * (col + 1)} ${y}`;
  }
  path += ` L ${gap * (col + 1)} ${top + rowGap * rows}`;
  return path;
}
