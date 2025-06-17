import { OllamaClient, Message } from './ollama-client'

export interface ClaudeOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export class ClaudeAdapter {
  private ollama: OllamaClient
  private defaultModel: string

  constructor(options: ClaudeOptions = {}) {
    this.ollama = new OllamaClient()
    this.defaultModel = options.model || 'devstral'
  }

  async complete(prompt: string, options: ClaudeOptions = {}): Promise<string> {
    const messages: Message[] = []
    
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt })
    }
    
    messages.push({ role: 'user', content: prompt })

    let response = ''
    for await (const chunk of this.ollama.streamChat({
      model: options.model || this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7
    })) {
      response += chunk
    }

    return response
  }

  async *streamComplete(prompt: string, options: ClaudeOptions = {}): AsyncGenerator<string> {
    const messages: Message[] = []
    
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt })
    }
    
    messages.push({ role: 'user', content: prompt })

    for await (const chunk of this.ollama.streamChat({
      model: options.model || this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7
    })) {
      yield chunk
    }
  }

  async conversation(messages: Message[], options: ClaudeOptions = {}): Promise<string> {
    let response = ''
    for await (const chunk of this.ollama.streamChat({
      model: options.model || this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7
    })) {
      response += chunk
    }

    return response
  }
}