import type { ToolInfo } from '../types';

interface ToolMenuProps {
  tools: ToolInfo[];
  onSelect: (id: ToolInfo['id']) => void;
}

export function ToolMenu({ tools, onSelect }: ToolMenuProps) {
  return (
    <section className="tool-grid" aria-label="도구 메뉴">
      {tools.map((tool) => (
        <button key={tool.id} className="menu-card" onClick={() => onSelect(tool.id)} aria-label={`${tool.title} 열기`}>
          <span>{tool.title}</span>
          <small>{tool.description}</small>
        </button>
      ))}
      <article className="menu-card disabled-card" aria-label="추후 추가될 도구">
        <span>도구 추가 예정</span>
        <small>점수판, 시작 플레이어 뽑기 등 확장 가능</small>
      </article>
    </section>
  );
}
