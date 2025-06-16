import { NextRequest, NextResponse } from 'next/server'
import { OllamaClient } from '@/lib/ollama'

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json()

    const ollama = new OllamaClient(process.env.OLLAMA_HOST || 'http://localhost:11434')
    
    const systemPrompt = `You are an AI coding assistant integrated into a code editor. 
    Current file: ${context.currentFile}
    Current code context is provided. Help the user with coding tasks, explanations, and improvements.
    Be concise and provide code examples when relevant.`

    const ollamaMessages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'system' as const, content: `Current code:\n\`\`\`\n${context.currentCode}\n\`\`\`` },
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of ollama.streamChat({
            model: process.env.OLLAMA_MODEL || 'devstral',
            messages: ollamaMessages,
            temperature: 0.7
          })) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}