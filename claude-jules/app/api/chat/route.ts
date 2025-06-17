import { NextRequest, NextResponse } from 'next/server'
import { JulesAgent } from '../../../agents/jules'

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const jules = new JulesAgent()
    const tasks = await jules.planTask(message, context)
    
    // Execute the first task or provide a planning response
    let response = ''
    if (tasks.length > 0) {
      const firstTask = tasks[0]
      response = await jules.executeTask(firstTask, context)
    } else {
      response = "I understand your request. Let me help you with that."
    }

    return NextResponse.json({
      response,
      tasks: tasks.map(task => ({
        id: task.id,
        type: task.type,
        description: task.description,
        priority: task.priority
      }))
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}