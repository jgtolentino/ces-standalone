import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ces/chat
 * body: { q: string }
 */
export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY not set" },
      { status: 500 }
    );
  }

  const { q } = await req.json();
  if (!q) return Response.json({ error: "missing q" }, { status: 400 });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are BrandBot CES. Answer in two sentences, focus on creative effectiveness.",
      },
      { role: "user", content: q },
    ],
  });

  return Response.json({ a: completion.choices[0].message.content });
}
