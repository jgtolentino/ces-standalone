#!/usr/bin/env tsx

import readline from 'readline'
import { JulesAgent } from '../agents/jules'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const jules = new JulesAgent()

console.log(`🤖 Claude-Jules OS CLI`)
console.log('Type "exit" to quit, "help" for commands\n')

async function processCommand(input: string) {
  if (input.toLowerCase() === 'exit') {
    console.log('\n👋 Goodbye!')
    rl.close()
    process.exit(0)
  }

  if (input.toLowerCase() === 'help') {
    console.log(`
Available commands:
- fix [description]: Fix code issues
- analyze [file]: Analyze codebase
- generate [request]: Generate code/content
- summarize: Summarize current project
- workflow [name]: Run predefined workflow
- exit: Quit CLI
    `)
    prompt()
    return
  }

  try {
    console.log('\n🧠 Planning tasks...')
    const tasks = await jules.planTask(input)
    
    console.log(`\n📋 Created ${tasks.length} task(s):`)
    tasks.forEach((task, i) => {
      console.log(`  ${i + 1}. ${task.description} (${task.type}, ${task.priority})`)
    })

    console.log('\n🚀 Executing tasks...\n')
    for (const task of tasks) {
      console.log(`⏳ ${task.description}`)
      const result = await jules.executeTask(task)
      console.log(`✅ Result:\n${result}\n`)
    }
  } catch (error) {
    console.error('\n❌ Error:', error)
  }
  
  prompt()
}

function prompt() {
  rl.question('👤 Command: ', processCommand)
}

prompt()