import { DevstralEngine, CodeContext, CodeResult } from '../core/ai-engine/devstral-engine'

export interface CodeTask {
  id: string
  type: 'generate' | 'fix' | 'enhance' | 'explain' | 'refactor'
  prompt: string
  context: CodeContext
  result?: CodeResult
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export class CoderAgent {
  private devstral: DevstralEngine

  constructor() {
    this.devstral = new DevstralEngine()
  }

  async executeCodeTask(task: CodeTask): Promise<CodeResult> {
    try {
      let result: CodeResult

      switch (task.type) {
        case 'generate':
          result = await this.devstral.generateCode(task.prompt, task.context)
          break
        case 'fix':
          if (!task.context.currentCode) {
            throw new Error('Current code required for fix task')
          }
          result = await this.devstral.fixCode(task.context.currentCode, task.prompt, task.context)
          break
        case 'enhance':
          if (!task.context.currentCode) {
            throw new Error('Current code required for enhance task')
          }
          result = await this.devstral.enhanceCode(task.context.currentCode, task.prompt, task.context)
          break
        case 'explain':
          if (!task.context.currentCode) {
            throw new Error('Current code required for explain task')
          }
          const explanation = await this.devstral.explainCode(task.context.currentCode, task.context)
          result = {
            code: task.context.currentCode,
            explanation,
            changes: [],
            language: task.context.language || 'text'
          }
          break
        case 'refactor':
          if (!task.context.currentCode) {
            throw new Error('Current code required for refactor task')
          }
          result = await this.devstral.enhanceCode(
            task.context.currentCode, 
            `refactor for better structure, readability and performance: ${task.prompt}`, 
            task.context
          )
          break
        default:
          throw new Error(`Unknown task type: ${task.type}`)
      }

      return result
    } catch (error) {
      throw new Error(`Code task failed: ${error}`)
    }
  }

  async *streamCodeGeneration(prompt: string, context: CodeContext): AsyncGenerator<string> {
    for await (const chunk of this.devstral.streamGenerate(prompt, context)) {
      yield chunk
    }
  }

  async quickFix(code: string, language?: string): Promise<CodeResult> {
    return await this.devstral.fixCode(
      code, 
      'analyze and fix any bugs, syntax errors, or potential issues', 
      { language, currentCode: code }
    )
  }

  async optimize(code: string, language?: string): Promise<CodeResult> {
    return await this.devstral.enhanceCode(
      code, 
      'optimize for performance, readability, and best practices', 
      { language, currentCode: code }
    )
  }

  async addDocumentation(code: string, language?: string): Promise<CodeResult> {
    return await this.devstral.enhanceCode(
      code, 
      'add comprehensive documentation, comments, and type annotations', 
      { language, currentCode: code }
    )
  }

  async generateTests(code: string, language?: string): Promise<CodeResult> {
    const testPrompt = `Generate comprehensive unit tests for this code. Include:
    - Happy path tests
    - Edge cases
    - Error handling tests
    - Mock external dependencies if needed
    
    Use appropriate testing framework for ${language || 'the detected language'}.`

    return await this.devstral.generateCode(testPrompt, { 
      currentCode: code, 
      language 
    })
  }

  async convertLanguage(code: string, fromLang: string, toLang: string): Promise<CodeResult> {
    const convertPrompt = `Convert this ${fromLang} code to ${toLang}. 
    Maintain the same functionality and logic while following ${toLang} best practices and idioms.`

    return await this.devstral.generateCode(convertPrompt, { 
      currentCode: code, 
      language: fromLang 
    })
  }
}