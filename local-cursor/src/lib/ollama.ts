export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OllamaOptions {
  model: string
  messages: OllamaMessage[]
  stream?: boolean
  temperature?: number
}

export class OllamaClient {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl
  }

  async chat(options: OllamaOptions): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        stream: options.stream ?? true,
        options: {
          temperature: options.temperature ?? 0.7,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    return response
  }

  async *streamChat(options: OllamaOptions): AsyncGenerator<string> {
    const response = await this.chat({ ...options, stream: true })
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('No response body')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          if (data.message?.content) {
            yield data.message.content
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}