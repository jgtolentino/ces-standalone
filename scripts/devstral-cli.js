#!/usr/bin/env node

/**
 * Devstral CLI Wrapper
 * Quick access to Devstral for coding tasks
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

const execAsync = promisify(exec);

const COMMANDS = {
  help: {
    description: 'Show this help message',
    usage: 'devstral help'
  },
  code: {
    description: 'Generate code from description',
    usage: 'devstral code "create a React component for a todo list"'
  },
  review: {
    description: 'Review code and suggest improvements',
    usage: 'devstral review "function add(a,b){return a+b}"'
  },
  debug: {
    description: 'Help debug code issues',
    usage: 'devstral debug "my array forEach is not working correctly"'
  },
  explain: {
    description: 'Explain code or concepts',
    usage: 'devstral explain "what is a closure in JavaScript"'
  },
  refactor: {
    description: 'Refactor code for better practices',
    usage: 'devstral refactor "legacy function code here"'
  },
  chat: {
    description: 'Start interactive chat mode',
    usage: 'devstral chat'
  }
};

async function checkDevstralAvailable() {
  try {
    const { stdout } = await execAsync('ollama list');
    return stdout.includes('devstral');
  } catch (error) {
    return false;
  }
}

async function runDevstral(prompt, systemPrompt = '') {
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;
  
  try {
    console.log('🤖 Devstral is thinking...\n');
    const startTime = Date.now();
    
    const { stdout, stderr } = await execAsync(`ollama run devstral:latest "${fullPrompt}"`);
    
    const duration = Date.now() - startTime;
    
    if (stderr && stderr.trim()) {
      console.log(`⚠️  ${stderr.trim()}\n`);
    }
    
    console.log(stdout);
    console.log(`\n⏱️  Response time: ${duration}ms`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    if (error.message.includes('not found')) {
      console.log('\n💡 Devstral might not be installed yet. Try:');
      console.log('   ollama pull devstral:latest');
    }
  }
}

async function startChatMode() {
  console.log('🚀 Starting Devstral Chat Mode');
  console.log('💡 Type "exit" to quit, "help" for commands\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };
  
  while (true) {
    try {
      const input = await askQuestion('You: ');
      
      if (input.toLowerCase() === 'exit') {
        console.log('👋 Goodbye!');
        break;
      }
      
      if (input.toLowerCase() === 'help') {
        showHelp();
        continue;
      }
      
      await runDevstral(input, 'You are Devstral, a helpful coding assistant. Provide concise, practical answers.');
      console.log('\\n' + '─'.repeat(50) + '\\n');
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  rl.close();
}

function showHelp() {
  console.log('🤖 Devstral CLI - Advanced Coding Assistant\n');
  console.log('Available commands:\n');
  
  Object.entries(COMMANDS).forEach(([cmd, info]) => {
    console.log(`  ${cmd.padEnd(10)} - ${info.description}`);
    console.log(`  ${' '.repeat(13)} Usage: ${info.usage}\n`);
  });
  
  console.log('Examples:');
  console.log('  devstral code "TypeScript interface for user data"');
  console.log('  devstral review "const users = data.filter(u => u.active == true)"');
  console.log('  devstral debug "my React component won\'t re-render"');
  console.log('  devstral chat  # Start interactive mode');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    return;
  }
  
  const command = args[0].toLowerCase();
  const input = args.slice(1).join(' ');
  
  // Check if Devstral is available
  const isAvailable = await checkDevstralAvailable();
  if (!isAvailable) {
    console.log('❌ Devstral model not found!');
    console.log('💡 Install it with: ollama pull devstral:latest');
    console.log('⏳ This may take a while (14GB download)');
    return;
  }
  
  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    case 'code':
      await runDevstral(input, 'You are a code generator. Generate clean, well-commented code based on the user\'s description. Include type definitions where appropriate.');
      break;
      
    case 'review':
      await runDevstral(input, 'You are a code reviewer. Analyze the provided code and suggest specific improvements for readability, performance, security, and best practices.');
      break;
      
    case 'debug':
      await runDevstral(input, 'You are a debugging assistant. Help identify potential issues in the code or scenario described and provide specific solutions.');
      break;
      
    case 'explain':
      await runDevstral(input, 'You are a coding tutor. Explain the concept, code, or technology in a clear, educational way with examples.');
      break;
      
    case 'refactor':
      await runDevstral(input, 'You are a refactoring expert. Improve the provided code for better maintainability, readability, and modern best practices.');
      break;
      
    case 'chat':
      await startChatMode();
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log('💡 Use "devstral help" to see available commands');
  }
}

// Make the script executable
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}