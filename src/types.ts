export type ToolId = 'home' | 'dice' | 'ladder' | 'wheel' | 'timer';

export interface ToolInfo {
  id: Exclude<ToolId, 'home'>;
  title: string;
  description: string;
}
