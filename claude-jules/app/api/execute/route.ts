import { NextRequest, NextResponse } from 'next/server'
import { CoderAgent } from '../../../agents/coder'
import { OperatorAgent } from '../../../agents/operator'

export async function POST(request: NextRequest) {
  try {
    const { type, task, options } = await request.json()
    
    if (!type || !task) {
      return NextResponse.json({ error: 'Type and task are required' }, { status: 400 })
    }

    let result: any

    switch (type) {
      case 'code':
        const coder = new CoderAgent()
        result = await coder.executeCodeTask(task)
        break
        
      case 'shell':
        const operator = new OperatorAgent()
        result = await operator.executeShell(task.command, options)
        break
        
      case 'git':
        const gitOperator = new OperatorAgent()
        switch (task.operation) {
          case 'status':
            result = await gitOperator.gitStatus()
            break
          case 'add':
            result = await gitOperator.gitAdd(task.files)
            break
          case 'commit':
            result = await gitOperator.gitCommit(task.message)
            break
          case 'push':
            result = await gitOperator.gitPush(task.remote, task.branch)
            break
          default:
            return NextResponse.json({ error: 'Unknown git operation' }, { status: 400 })
        }
        break
        
      default:
        return NextResponse.json({ error: 'Unknown execution type' }, { status: 400 })
    }

    return NextResponse.json({ result })

  } catch (error) {
    console.error('Execute API error:', error)
    return NextResponse.json(
      { error: 'Execution failed', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}