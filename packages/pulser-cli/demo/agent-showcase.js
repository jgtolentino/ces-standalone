#!/usr/bin/env node

import chalk from 'chalk';
import boxen from 'boxen';
import { AgentOrchestrator } from '../agents/AgentOrchestrator.js';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log(boxen(
  chalk.cyan.bold('🤖 Pulser CLI Agent System Showcase') + '\n' +
  chalk.gray('Demonstrating local-first AI with cloud fallback'),
  {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  }
));

// Initialize orchestrator
const orchestrator = new AgentOrchestrator({
  defaultMode: 'hybrid',
  cloudConfig: {
    apiUrl: process.env.PULSER_API_URL || 'https://api.pulser.ai',
    authToken: process.env.PULSER_API_TOKEN
  }
});

async function runDemo() {
  try {
    console.log(chalk.blue('\n📊 System Status Check...\n'));
    
    // Check system status
    const status = await orchestrator.getSystemStatus();
    console.log(`Overall Health: ${getHealthColor(status.health)}`);
    console.log(`Agents Available: ${chalk.cyan(status.agents)}`);
    console.log(`Local Executor: ${getStatusColor(status.executors.local.status)}`);
    console.log(`Cloud Executor: ${getStatusColor(status.executors.cloud.status)}`);
    console.log(`Hybrid Executor: ${getStatusColor(status.executors.hybrid.status)}`);
    
    console.log(chalk.blue('\n🔍 Available Agents...\n'));
    
    // List available agents
    const agents = await orchestrator.listAgents();
    agents.forEach(agent => {
      console.log(`${chalk.cyan('●')} ${chalk.bold(agent.name)} v${agent.version}`);
      console.log(`  ${agent.description}`);
      console.log(`  ${chalk.gray(`Mode: ${agent.executionMode} | Capabilities: ${agent.capabilities.join(', ')}`)}`);
      console.log();
    });
    
    console.log(chalk.blue('\n🚀 Demonstration: Code Review Agent\n'));
    
    // Sample code for demonstration
    const sampleCode = `
function processPayment(amount, cardNumber, cvv) {
  // No input validation!
  const sql = "SELECT * FROM users WHERE card = '" + cardNumber + "'";
  
  // Storing sensitive data in plain text
  localStorage.setItem('payment_info', JSON.stringify({
    amount: amount,
    card: cardNumber,
    cvv: cvv
  }));
  
  // Inefficient loop
  let total = 0;
  for (let i = 0; i < 1000000; i++) {
    total += Math.random();
  }
  
  return total > amount;
}`;

    console.log(chalk.gray('Sample Code to Review:'));
    console.log(chalk.yellow('```javascript'));
    console.log(sampleCode.trim());
    console.log(chalk.yellow('```'));
    
    console.log(chalk.blue('\n⚡ Running Code Review (Hybrid Mode)...\n'));
    
    // Execute code review
    const request = {
      input: sampleCode,
      context: {
        language: 'javascript'
      },
      preferences: {
        format: 'markdown',
        verbose: true,
        includeExplanation: true
      },
      parameters: {
        executionMode: 'hybrid'
      }
    };
    
    const startTime = Date.now();
    const response = await orchestrator.executeRequest('codereview', request);
    const duration = Date.now() - startTime;
    
    console.log(chalk.green('✓ Code Review Completed\n'));
    
    // Display results
    console.log(response.content);
    
    // Display metadata
    console.log('\n' + chalk.gray('═'.repeat(60)));
    console.log(chalk.gray(`Agent: ${response.metadata.agent}`));
    console.log(chalk.gray(`Execution Mode: ${response.metadata.executionMode}`));
    console.log(chalk.gray(`Model: ${response.metadata.model || 'N/A'}`));
    console.log(chalk.gray(`Confidence: ${Math.round(response.metadata.confidence * 100)}%`));
    console.log(chalk.gray(`Duration: ${duration}ms`));
    if (response.metadata.cost) {
      console.log(chalk.gray(`Cost: $${response.metadata.cost.toFixed(4)}`));
    }
    
    console.log(chalk.blue('\n🎯 Agent Auto-Selection Demo\n'));
    
    // Test auto-selection
    const testRequests = [
      'Review this function for security issues',
      'Explain what this code does',
      'Generate unit tests for this code',
      'Fix the performance problems'
    ];
    
    for (const testRequest of testRequests) {
      const bestAgent = await orchestrator.findBestAgent({
        input: testRequest,
        context: {},
        preferences: { format: 'markdown' }
      });
      
      console.log(`"${chalk.yellow(testRequest)}" → ${chalk.cyan(bestAgent || 'No suitable agent')}`);
    }
    
    console.log(chalk.blue('\n🎉 Demonstration Complete!\n'));
    console.log(chalk.green('Key Features Demonstrated:'));
    console.log('• Hybrid execution (local + cloud)');
    console.log('• Intelligent agent selection');
    console.log('• Comprehensive code analysis');
    console.log('• Real-time cost and performance metrics');
    console.log('• Modular agent architecture');
    
    console.log(chalk.blue('\n📖 Usage Examples:\n'));
    console.log(chalk.cyan('pulser codereview app.js'));
    console.log(chalk.cyan('pulser codereview --code "function test(){}"'));
    console.log(chalk.cyan('pulser agents list'));
    console.log(chalk.cyan('pulser status'));
    console.log(chalk.cyan('pulser chat'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Demo failed:'), error.message);
    if (error.message.includes('Ollama')) {
      console.log(chalk.yellow('\n💡 Tip: Start Ollama with: ollama serve'));
    }
    if (error.message.includes('Pulser API')) {
      console.log(chalk.yellow('\n💡 Tip: Set PULSER_API_TOKEN for cloud features'));
    }
  } finally {
    orchestrator.dispose();
  }
}

function getHealthColor(health) {
  switch (health) {
    case 'healthy': return chalk.green('HEALTHY');
    case 'degraded': return chalk.yellow('DEGRADED');
    case 'critical': return chalk.red('CRITICAL');
    default: return chalk.gray('UNKNOWN');
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'healthy': return chalk.green('●');
    case 'degraded': return chalk.yellow('●');
    case 'down': return chalk.red('●');
    default: return chalk.gray('●');
  }
}

// Run the demo
runDemo();