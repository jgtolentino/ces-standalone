import { OllamaClient, Message } from '../core/ai-engine/ollama-client'

export interface JulesTask {
  id: string
  type: 'code' | 'analyze' | 'fix' | 'generate' | 'summarize'
  description: string
  context?: any
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export class JulesAgent {
  private ollama: OllamaClient
  private model: string

  constructor(model: string = 'devstral') {
    this.ollama = new OllamaClient()
    this.model = model
  }

  async planTask(userInput: string, context?: any): Promise<JulesTask[]> {
    const systemPrompt = `You are Jules, an AI assistant that breaks down user requests into actionable tasks.
    
    Given a user request, decompose it into specific, executable tasks.
    Return a JSON array of tasks with this structure:
    {
      "id": "unique_id",
      "type": "code|analyze|fix|generate|summarize",
      "description": "specific task description",
      "priority": "high|medium|low"
    }
    
    Context: ${JSON.stringify(context || {})}
    `

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput }
    ]

    let response = ''
    for await (const chunk of this.ollama.streamChat({
      model: this.model,
      messages,
      temperature: 0.3
    })) {
      response += chunk
    }

    try {
      const tasks = JSON.parse(response)
      return tasks.map((task: any, index: number) => ({
        ...task,
        id: task.id || `task_${Date.now()}_${index}`,
        status: 'pending' as const
      }))
    } catch (e) {
      // Fallback if JSON parsing fails
      return [{
        id: `task_${Date.now()}`,
        type: 'analyze' as const,
        description: userInput,
        priority: 'medium' as const,
        status: 'pending' as const
      }]
    }
  }

  async executeTask(task: JulesTask, context?: any): Promise<string> {
    const systemPrompt = `You are executing a specific task. Provide a detailed response.
    
    Task Type: ${task.type}
    Task Description: ${task.description}
    Context: ${JSON.stringify(context || {})}
    
    Be specific and actionable in your response.`

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: task.description }
    ]

    let response = ''
    for await (const chunk of this.ollama.streamChat({
      model: this.model,
      messages,
      temperature: 0.7
    })) {
      response += chunk
    }

    return response
  }
}