export interface ClaudeMsg { role?: string; content: string }
export const safeMessages = (msgs: ClaudeMsg[] = []) => {
  const filtered = msgs.filter(m => m?.role && m?.content);
  if (filtered.length !== msgs.length) {
    console.warn("Claude: dropped malformed messages");
  }
  return filtered;
};
