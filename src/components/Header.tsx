import type { ToolId } from '../types';

interface HeaderProps {
  activeTool: ToolId;
  onHome: () => void;
}

export function Header({ activeTool, onHome }: HeaderProps) {
  return (
    <header className="app-header">
      {activeTool !== 'home' ? (
        <button className="ghost-button back-button" onClick={onHome} aria-label="메인 화면으로 돌아가기">
          ←
        </button>
      ) : (
        <span className="header-spacer" />
      )}
      <h1>보드게임 헬퍼</h1>
      <span className="header-spacer" />
    </header>
  );
}
