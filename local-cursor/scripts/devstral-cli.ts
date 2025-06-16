#!/usr/bin/env tsx

import readline from 'readline'
import { OllamaClient } from '../src/lib/ollama'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const ollama = new OllamaClient(process.env.OLLAMA_HOST || 'http://localhost:11434')
const model = process.env.OLLAMA_MODEL || 'devstral'

console.log(`🤖 Devstral CLI (using ${model})`)
console.log('Type "exit" to quit\n')

const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

async function chat(input: string) {
  messages.push({ role: 'user', content: input })
  
  process.stdout.write('\n💭 Thinking')
  
  let response = ''
  const dots = setInterval(() => process.stdout.write('.'), 500)
  
  try {
    for await (const chunk of ollama.streamChat({ model, messages })) {
      if (response === '') {
        clearInterval(dots)
        process.stdout.write('\r\x1b[K') // Clear the line
        console.log('\n🤖 Devstral:')
      }
      process.stdout.write(chunk)
      response += chunk
    }
    
    messages.push({ role: 'assistant', content: response })
    console.log('\n')
  } catch (error) {
    clearInterval(dots)
    console.error('\n❌ Error:', error)
  }
  
  prompt()
}

function prompt() {
  rl.question('👤 You: ', (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!')
      rl.close()
      process.exit(0)
    }
    
    chat(input)
  })
}

// Start the conversation
prompt()