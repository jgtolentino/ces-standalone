"use client";
import { useState } from "react";

export default function CesChat() {
  const [q, setQ] = useState("");
  const [a, setA] = useState<string | null>(null);
  
  async function ask() {
    setA("…");
    const r = await fetch("/api/ces/chat", {
      method: "POST",
      body: JSON.stringify({ q }),
      headers: { "content-type": "application/json" },
    });
    setA((await r.json()).a);
  }
  
  return (
    <div className="space-y-4">
      <input
        className="w-full p-2 border rounded"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask CES…"
      />
      <button className="px-3 py-1 bg-black text-white rounded" onClick={ask}>
        Ask
      </button>
      {a && <p className="whitespace-pre-wrap">{a}</p>}
    </div>
  );
}
