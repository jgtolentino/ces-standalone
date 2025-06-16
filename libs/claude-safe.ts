export interface ClaudeMsg { role?: string; content: string }
export const safeMessages = (msgs: ClaudeMsg[] | undefined) =>
  (msgs ?? []).filter(m => m?.role && m?.content);
