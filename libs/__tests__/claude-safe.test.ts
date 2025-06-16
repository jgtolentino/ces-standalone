import { safeMessages } from "../claude-safe";

describe("safeMessages", () => {
  it("filters malformed messages", () => {
    const messages = [
      { content: "hi" } as any, // Missing role
      { role: "user", content: "ok" }, // Valid message
      { role: "assistant" } as any, // Missing content
      { role: "user", content: "" }, // Empty content (should be filtered)
      { role: "user", content: "valid message" }, // Valid message
    ];

    const result = safeMessages(messages);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ role: "user", content: "ok" });
    expect(result[1]).toEqual({ role: "user", content: "valid message" });
  });

  it("handles undefined input", () => {
    expect(safeMessages(undefined)).toEqual([]);
  });

  it("handles empty array", () => {
    expect(safeMessages([])).toEqual([]);
  });

  it("returns all messages when all are valid", () => {
    const messages = [
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi there" },
    ];

    const result = safeMessages(messages);
    expect(result).toHaveLength(2);
    expect(result).toEqual(messages);
  });

  it("logs warning when messages are dropped", () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const messages = [
      { content: "hi" } as any, // Missing role
      { role: "user", content: "ok" }, // Valid message
    ];

    safeMessages(messages);
    
    expect(consoleSpy).toHaveBeenCalledWith("Claude: dropped malformed messages");
    
    consoleSpy.mockRestore();
  });

  it("does not log warning when no messages are dropped", () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const messages = [
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi there" },
    ];

    safeMessages(messages);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
