import { ClaudeAdapter } from './claude-adapter'

export interface CodeContext {
  filename?: string
  language?: string
  currentCode?: string
  selection?: string
  cursorPosition?: number
}

export interface CodeResult {
  code: string
  explanation: string
  changes: string[]
  language: string
}

export class DevstralEngine {
  private claude: ClaudeAdapter

  constructor() {
    this.claude = new ClaudeAdapter({ model: 'devstral' })
  }

  async generateCode(prompt: string, context: CodeContext = {}): Promise<CodeResult> {
    const systemPrompt = `You are Devstral, an expert code generation AI. Generate clean, efficient, and well-documented code.

Context:
- Filename: ${context.filename || 'unknown'}
- Language: ${context.language || 'auto-detect'}
- Current code: ${context.currentCode ? 'provided' : 'none'}

Always respond with:
1. Generated code in a code block
2. Brief explanation
3. List of key changes/features
4. Detected/target language

Be concise but comprehensive.`

    const fullPrompt = `${prompt}

${context.currentCode ? `Current code:\n\`\`\`${context.language || ''}\n${context.currentCode}\n\`\`\`` : ''}

${context.selection ? `Selected code:\n\`\`\`${context.language || ''}\n${context.selection}\n\`\`\`` : ''}`

    const response = await this.claude.complete(fullPrompt, { 
      systemPrompt,
      temperature: 0.3 
    })

    return this.parseCodeResponse(response, context.language)
  }

  async fixCode(code: string, issue: string, context: CodeContext = {}): Promise<CodeResult> {
    const systemPrompt = `You are Devstral, an expert code debugging AI. Fix bugs and improve code quality.

Focus on:
- Fixing the specific issue mentioned
- Maintaining code style and structure
- Adding error handling where needed
- Improving performance if possible

Always provide the complete fixed code.`

    const prompt = `Fix this code issue: ${issue}

Current code:
\`\`\`${context.language || ''}
${code}
\`\`\``

    const response = await this.claude.complete(prompt, { 
      systemPrompt,
      temperature: 0.2 
    })

    return this.parseCodeResponse(response, context.language)
  }

  async enhanceCode(code: string, enhancement: string, context: CodeContext = {}): Promise<CodeResult> {
    const systemPrompt = `You are Devstral, an expert code enhancement AI. Improve and optimize existing code.

Enhancement goals:
- Add the requested feature/improvement
- Maintain backward compatibility
- Follow best practices
- Add appropriate comments/documentation

Provide the complete enhanced code.`

    const prompt = `Enhance this code: ${enhancement}

Current code:
\`\`\`${context.language || ''}
${code}
\`\`\``

    const response = await this.claude.complete(prompt, { 
      systemPrompt,
      temperature: 0.4 
    })

    return this.parseCodeResponse(response, context.language)
  }

  async explainCode(code: string, context: CodeContext = {}): Promise<string> {
    const systemPrompt = `You are Devstral, an expert code explanation AI. Provide clear, detailed explanations of code functionality.

Explain:
- What the code does (high-level purpose)
- How it works (key logic/algorithms)
- Important functions/methods
- Potential issues or improvements
- Dependencies and requirements`

    const prompt = `Explain this code:

\`\`\`${context.language || ''}
${code}
\`\`\``

    return await this.claude.complete(prompt, { 
      systemPrompt,
      temperature: 0.5 
    })
  }

  async *streamGenerate(prompt: string, context: CodeContext = {}): AsyncGenerator<string> {
    const systemPrompt = `You are Devstral, generating code in real-time. Provide clean, working code with explanations.`

    const fullPrompt = `${prompt}

${context.currentCode ? `Context:\n\`\`\`${context.language || ''}\n${context.currentCode}\n\`\`\`` : ''}`

    for await (const chunk of this.claude.streamComplete(fullPrompt, { 
      systemPrompt,
      temperature: 0.3 
    })) {
      yield chunk
    }
  }

  private parseCodeResponse(response: string, language?: string): CodeResult {
    // Extract code blocks
    const codeBlockRegex = /```(?:(\w+)\n)?([\s\S]*?)```/g
    const codeBlocks: Array<{ language: string; code: string }> = []
    let match

    while ((match = codeBlockRegex.exec(response)) !== null) {
      codeBlocks.push({
        language: match[1] || language || 'text',
        code: match[2].trim()
      })
    }

    // Use the first/largest code block as main code
    const mainCodeBlock = codeBlocks.reduce((prev, current) => 
      current.code.length > prev.code.length ? current : prev, 
      { language: language || 'text', code: '' }
    )

    // Extract explanation (text before first code block or after last)
    const explanation = response
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^\s*[\-\*]\s*/gm, '• ')
      .trim()

    // Extract changes (look for bullet points or numbered lists)
    const changeMatches = explanation.match(/(?:^|\n)(?:[\-\*•]\s+|[\d]+\.\s+)(.+)/gm) || []
    const changes = changeMatches.map(change => 
      change.replace(/^[\s\-\*•\d\.]+/, '').trim()
    ).filter(change => change.length > 0)

    return {
      code: mainCodeBlock.code,
      explanation: explanation.split('\n').slice(0, 3).join(' ').trim(),
      changes: changes.slice(0, 5), // Limit to 5 key changes
      language: mainCodeBlock.language
    }
  }
}