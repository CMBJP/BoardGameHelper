import { useEffect, useMemo, useState } from 'react';
import { loadStored, saveStored } from '../../lib/storage';
import { canSpin, cleanWheelItems, createSpinPlan, truncateWheelLabel } from './wheelLogic';

const ITEMS_KEY = 'bgh:wheel:items';
const colors = ['#39d9ff', '#62f0c8', '#f7c948', '#ff8a65', '#b58cff', '#ff6b9a', '#6cc6ff', '#a1e44d'];

export function WheelTool() {
  const [items, setItems] = useState<string[]>(() => loadStored(ITEMS_KEY, ['선 플레이어', '은행 담당', '카드 섞기', '간식 준비']));
  const [rotation, setRotation] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const cleanItems = useMemo(() => cleanWheelItems(items), [items]);
  const spinReady = canSpin(items);

  useEffect(() => saveStored(ITEMS_KEY, items), [items]);

  function update(index: number, value: string) {
    setItems(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function spin() {
    const plan = createSpinPlan(cleanItems.length);
    setWinnerIndex(null);
    setSpinning(true);
    setRotation((prev) => prev + plan.rotation);
    window.setTimeout(() => {
      setWinnerIndex(plan.winnerIndex);
      setSpinning(false);
    }, 3800);
  }

  return (
    <main className="tool-screen">
      <section className="panel">
        <h2>원판 돌리기</h2>
        <div className="name-list">
          {items.map((item, index) => (
            <div className="inline-edit" key={index}>
              <input value={item} onChange={(event) => update(index, event.target.value)} aria-label={`원판 항목 ${index + 1}`} />
              <button className="icon-button" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))} aria-label={`원판 항목 ${index + 1} 삭제`}>
                ×
              </button>
            </div>
          ))}
        </div>
        <button className="secondary-button" onClick={() => setItems([...items, ''])} aria-label="원판 항목 추가">
          항목 추가
        </button>
        {!spinReady && <p className="notice">항목은 최소 2개 이상 필요합니다.</p>}
      </section>

      <section className="panel wheel-panel">
        <div className="wheel-pointer" aria-hidden="true" />
        <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }} role="img" aria-label="추첨 원판">
          <WheelSvg items={cleanItems} winnerIndex={winnerIndex} />
        </div>
        <button className="primary-button" onClick={spin} disabled={!spinReady || spinning} aria-label="원판 돌리기">
          {spinning ? '돌아가는 중...' : winnerIndex === null ? '돌리기' : '다시 돌리기'}
        </button>
      </section>

      {winnerIndex !== null && (
        <div className="result-modal" role="dialog" aria-modal="true" aria-label="원판 당첨 결과">
          <div>
            <span>결과</span>
            <strong>{cleanItems[winnerIndex]}</strong>
            <button className="primary-button" onClick={() => setWinnerIndex(null)} aria-label="결과 닫기">
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function WheelSvg({ items, winnerIndex }: { items: string[]; winnerIndex: number | null }) {
  const radius = 150;
  const center = 160;
  const slice = 360 / Math.max(items.length, 1);
  const fontSize = items.length > 8 ? 10 : items.length > 5 ? 12 : 14;

  return (
    <svg viewBox="0 0 320 320">
      {items.map((item, index) => {
        const start = index * slice;
        const end = start + slice;
        const largeArc = slice > 180 ? 1 : 0;
        const p1 = point(center, radius, start);
        const p2 = point(center, radius, end);
        const mid = start + slice / 2;
        const labelPoint = point(center, radius * 0.6, mid);
        return (
          <g key={`${item}-${index}`} className={winnerIndex === index ? 'wheel-slice winner' : 'wheel-slice'}>
            <path d={`M ${center} ${center} L ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`} fill={colors[index % colors.length]} />
            <text x={labelPoint.x} y={labelPoint.y} transform={`rotate(${mid + 90} ${labelPoint.x} ${labelPoint.y})`} fontSize={fontSize}>
              {truncateWheelLabel(item, items.length > 8 ? 8 : 12)}
            </text>
          </g>
        );
      })}
      <circle cx={center} cy={center} r="28" fill="#07111f" stroke="#e9f8ff" strokeWidth="4" />
    </svg>
  );
}

function point(center: number, radius: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(rad),
    y: center + radius * Math.sin(rad)
  };
}
