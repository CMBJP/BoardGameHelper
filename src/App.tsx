import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { ToolMenu } from './components/ToolMenu';
import { DiceTool } from './features/dice/DiceTool';
import { LadderTool } from './features/ladder/LadderTool';
import { TimerTool } from './features/timer/TimerTool';
import { WheelTool } from './features/wheel/WheelTool';
import type { ToolId, ToolInfo } from './types';

const tools: ToolInfo[] = [
  { id: 'dice', title: '주사위 굴리기', description: '여러 개의 D4부터 D20까지 빠르게 굴리기' },
  { id: 'ladder', title: '사다리타기', description: '참가자와 결과를 숨긴 채 무작위 매칭' },
  { id: 'wheel', title: '원판 돌리기', description: '항목을 나눠 자연스럽게 회전하는 추첨판' },
  { id: 'timer', title: '턴 타이머', description: '체스 시계처럼 턴과 시간을 관리' }
];

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('home');

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <Header activeTool={activeTool} onHome={() => setActiveTool('home')} />
        {activeTool === 'home' && (
          <main className="home-screen">
            <ToolMenu tools={tools} onSelect={setActiveTool} />
          </main>
        )}
        {activeTool === 'dice' && <DiceTool />}
        {activeTool === 'ladder' && <LadderTool />}
        {activeTool === 'wheel' && <WheelTool />}
        {activeTool === 'timer' && <TimerTool />}
      </div>
    </ErrorBoundary>
  );
}
