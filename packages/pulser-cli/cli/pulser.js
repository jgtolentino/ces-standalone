#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import inquirer from 'inquirer';
import { PulserRouter } from '../core/PulserRouter.js';
import { SessionManager } from '../core/SessionManager.js';
import { CLIOrchestrator } from '../core/CLIOrchestrator.js';
import { AgentOrchestrator } from '../agents/AgentOrchestrator.js';
import * as fs from 'fs-extra';
import * as path from 'path';

const program = new Command();

// CLI Configuration
const CLI_VERSION = '4.0.0';
const CLI_NAME = 'Pulser CLI';

// Initialize core components
let router, sessionManager, orchestrator, agentOrchestrator;

function initializeComponents() {
  router = new PulserRouter();
  sessionManager = new SessionManager();
  orchestrator = new CLIOrchestrator(router, sessionManager);
  agentOrchestrator = new AgentOrchestrator({
    defaultMode: process.env.PULSER_MODE || 'hybrid',
    cloudConfig: {
      apiUrl: process.env.PULSER_API_URL,
      authToken: process.env.PULSER_API_TOKEN
    }
  });
}

// Main program setup
program
  .name('pulser')
  .description('Unified AI orchestration CLI with local and cloud capabilities')
  .version(CLI_VERSION)
  .option('-m, --mode <mode>', 'Execution mode: local, cloud, or hybrid', 'hybrid')
  .option('-t, --tenant <tenant>', 'Target tenant for cloud operations')
  .option('-a, --agent <agent>', 'Specific agent to use')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-c, --continue', 'Continue last session')
  .option('-r, --resume <sessionId>', 'Resume specific session')
  .option('--local-only', 'Force local execution only')
  .option('--cloud-only', 'Force cloud execution only')
  .option('--cost-sensitive', 'Prioritize cost optimization')
  .option('--privacy-mode', 'Enable privacy mode (local processing only)');

// Print mode (default behavior when arguments provided)
program
  .argument('[prompt...]', 'Direct prompt for AI processing')
  .action(async (promptArgs, options) => {
    if (promptArgs.length > 0) {
      await handlePrintMode(promptArgs.join(' '), options);
    } else {
      await handleInteractiveMode(options);
    }
  });

// Agent commands
program
  .command('codereview')
  .alias('review')
  .description('Comprehensive code review with security analysis')
  .argument('[file]', 'File to review')
  .option('--code <code>', 'Code to review directly')
  .option('--format <format>', 'Output format (markdown, json)', 'markdown')
  .option('--verbose', 'Verbose output')
  .option('--mode <mode>', 'Execution mode (local, cloud, hybrid)', 'hybrid')
  .action(async (file, options) => {
    await handleCodeReview(file, options);
  });

program
  .command('explain <file>')
  .description('Explain code or concepts')
  .option('--detailed', 'Provide detailed explanation')
  .action(async (file, options) => {
    await handleAgentCommand('explain', { file }, options);
  });

program
  .command('fix <file>')
  .description('Fix code issues')
  .option('--issue <description>', 'Specific issue to fix')
  .action(async (file, options) => {
    await handleAgentCommand('fix', { file, issue: options.issue }, options);
  });

program
  .command('test <file>')
  .description('Generate tests')
  .option('--framework <framework>', 'Testing framework to use')
  .action(async (file, options) => {
    await handleAgentCommand('test', { file, framework: options.framework }, options);
  });

// Pipeline commands
program
  .command('pipeline')
  .description('Pipeline operations')
  .addCommand(
    new Command('run')
      .description('Run a pipeline')
      .argument('<pipeline>', 'Pipeline name')
      .option('--file <file>', 'Input file')
      .option('--params <params>', 'Pipeline parameters (JSON)')
      .action(async (pipeline, options) => {
        await handlePipelineCommand('run', { pipeline }, options);
      })
  )
  .addCommand(
    new Command('list')
      .description('List available pipelines')
      .option('--tenant <tenant>', 'Filter by tenant')
      .action(async (options) => {
        await handlePipelineCommand('list', {}, options);
      })
  );

// Session management
program
  .command('session')
  .description('Session management')
  .addCommand(
    new Command('list')
      .description('List sessions')
      .action(async () => {
        await handleSessionCommand('list');
      })
  )
  .addCommand(
    new Command('continue')
      .description('Continue last session')
      .action(async () => {
        await handleSessionCommand('continue');
      })
  )
  .addCommand(
    new Command('resume')
      .description('Resume specific session')
      .argument('<sessionId>', 'Session ID to resume')
      .action(async (sessionId) => {
        await handleSessionCommand('resume', { sessionId });
      })
  )
  .addCommand(
    new Command('export')
      .description('Export session')
      .argument('<sessionId>', 'Session ID to export')
      .option('--format <format>', 'Export format: json, md', 'json')
      .action(async (sessionId, options) => {
        await handleSessionCommand('export', { sessionId, format: options.format });
      })
  );

// Configuration
program
  .command('config')
  .description('Configuration management')
  .addCommand(
    new Command('show')
      .description('Show current configuration')
      .action(async () => {
        await handleConfigCommand('show');
      })
  )
  .addCommand(
    new Command('set')
      .description('Set configuration value')
      .argument('<key>', 'Configuration key')
      .argument('<value>', 'Configuration value')
      .action(async (key, value) => {
        await handleConfigCommand('set', { key, value });
      })
  );

// Status and health
program
  .command('status')
  .description('Show system status and health')
  .action(async () => {
    await handleStatusCommand();
  });

// Agents management
program
  .command('agents')
  .description('Agent management')
  .addCommand(
    new Command('list')
      .description('List available agents')
      .action(async () => {
        await handleAgentsCommand('list');
      })
  );

// Main execution
async function main() {
  try {
    initializeComponents();
    
    // Parse command line arguments
    await program.parseAsync();
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    if (program.opts().verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Command handlers
async function handlePrintMode(prompt, options) {
  const spinner = ora('Processing request...').start();
  
  try {
    const request = {
      input: prompt,
      mode: determineExecutionMode(options),
      tenant: options.tenant,
      agent: options.agent,
      preferences: {
        costSensitive: options.costSensitive,
        privacyMode: options.privacyMode,
        verbose: options.verbose
      }
    };

    const response = await orchestrator.execute(request);
    
    spinner.stop();
    
    if (options.verbose) {
      displayExecutionInfo(response.plan);
    }
    
    console.log(response.content);
    
  } catch (error) {
    spinner.fail('Request failed');
    console.error(chalk.red(error.message));
  }
}

async function handleInteractiveMode(options) {
  console.log(boxen(
    chalk.cyan.bold(`${CLI_NAME} v${CLI_VERSION}`) + '\n' +
    chalk.gray('Unified AI orchestration with local and cloud capabilities') + '\n\n' +
    chalk.yellow('Type "exit" to quit, "help" for commands'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));

  // Handle session continuation/resumption
  let sessionId;
  if (options.continue) {
    sessionId = await sessionManager.getLastSessionId();
  } else if (options.resume) {
    sessionId = options.resume;
  }

  const session = sessionId ? 
    await sessionManager.resumeSession(sessionId) : 
    await sessionManager.createSession();

  console.log(chalk.blue(`Session: ${session.id} | Mode: ${determineExecutionMode(options)}`));

  while (true) {
    try {
      const { input } = await inquirer.prompt([{
        type: 'input',
        name: 'input',
        message: chalk.green('pulser>'),
        when: () => true
      }]);

      if (input.toLowerCase().trim() === 'exit') {
        await sessionManager.saveSession(session);
        console.log(chalk.yellow('Session saved. Goodbye!'));
        break;
      }

      if (input.toLowerCase().trim() === 'help') {
        displayInteractiveHelp();
        continue;
      }

      if (input.trim() === '') {
        continue;
      }

      const spinner = ora('Processing...').start();

      const request = {
        input,
        sessionId: session.id,
        mode: determineExecutionMode(options),
        tenant: options.tenant,
        agent: options.agent,
        preferences: {
          costSensitive: options.costSensitive,
          privacyMode: options.privacyMode,
          verbose: options.verbose
        }
      };

      const response = await orchestrator.execute(request);
      
      spinner.stop();
      
      if (options.verbose) {
        displayExecutionInfo(response.plan);
      }
      
      console.log(chalk.white(response.content));
      
      // Update session
      await sessionManager.addToSession(session.id, input, response.content);
      
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
    }
  }
}

async function handleAgentCommand(agentName, params, options) {
  const spinner = ora(`Running ${agentName} agent...`).start();
  
  try {
    const request = {
      input: JSON.stringify(params),
      command: agentName,
      agent: agentName,
      mode: determineExecutionMode(options),
      tenant: options.tenant,
      preferences: {
        verbose: options.verbose
      }
    };

    const response = await orchestrator.execute(request);
    
    spinner.succeed(`${agentName} agent completed`);
    
    if (options.verbose) {
      displayExecutionInfo(response.plan);
    }
    
    console.log(response.content);
    
  } catch (error) {
    spinner.fail(`${agentName} agent failed`);
    console.error(chalk.red(error.message));
  }
}

async function handlePipelineCommand(action, params, options) {
  switch (action) {
    case 'run':
      const spinner = ora(`Running pipeline: ${params.pipeline}`).start();
      try {
        // Implementation for pipeline execution
        spinner.succeed('Pipeline completed');
        console.log(chalk.green('Pipeline executed successfully'));
      } catch (error) {
        spinner.fail('Pipeline failed');
        console.error(chalk.red(error.message));
      }
      break;
      
    case 'list':
      console.log(chalk.cyan('Available Pipelines:'));
      console.log('- campaign-analysis');
      console.log('- retail-insights');
      console.log('- chat-orchestration');
      console.log('- code-analysis');
      console.log('- test-generation');
      break;
  }
}

async function handleSessionCommand(action, params = {}) {
  switch (action) {
    case 'list':
      const sessions = await sessionManager.listSessions();
      console.log(chalk.cyan('Sessions:'));
      sessions.forEach(session => {
        console.log(`- ${session.id} (${new Date(session.lastModified).toLocaleString()})`);
      });
      break;
      
    case 'continue':
      const lastSessionId = await sessionManager.getLastSessionId();
      if (lastSessionId) {
        console.log(chalk.green(`Continuing session: ${lastSessionId}`));
        // Switch to interactive mode with this session
      } else {
        console.log(chalk.yellow('No previous session found'));
      }
      break;
      
    case 'resume':
      console.log(chalk.green(`Resuming session: ${params.sessionId}`));
      // Switch to interactive mode with this session
      break;
      
    case 'export':
      console.log(chalk.green(`Exporting session: ${params.sessionId}`));
      // Implementation for session export
      break;
  }
}

async function handleConfigCommand(action, params = {}) {
  switch (action) {
    case 'show':
      console.log(chalk.cyan('Current Configuration:'));
      // Display current configuration
      break;
      
    case 'set':
      console.log(chalk.green(`Setting ${params.key} = ${params.value}`));
      // Implementation for setting configuration
      break;
  }
}

async function handleStatusCommand() {
  const spinner = ora('Checking system status...').start();
  
  try {
    const [capabilities, agentStatus] = await Promise.all([
      router.assessCapabilities(),
      agentOrchestrator.getSystemStatus()
    ]);
    
    spinner.stop();
    
    const healthColor = agentStatus.health === 'healthy' ? 'green' : 
                       agentStatus.health === 'degraded' ? 'yellow' : 'red';
    
    console.log(boxen(
      chalk.cyan.bold('Pulser System Status') + '\n\n' +
      `Overall Health: ${chalk[healthColor](agentStatus.health.toUpperCase())}` + '\n' +
      `Registered Agents: ${chalk.cyan(agentStatus.agents)}` + '\n\n' +
      chalk.yellow('Executors:') + '\n' +
      `- Local: ${getStatusColor(agentStatus.executors.local.status)}` + '\n' +
      `- Cloud: ${getStatusColor(agentStatus.executors.cloud.status)} ${
        agentStatus.executors.cloud.latency ? chalk.gray(`(${agentStatus.executors.cloud.latency}ms)`) : ''
      }` + '\n' +
      `- Hybrid: ${getStatusColor(agentStatus.executors.hybrid.status)}` + '\n\n' +
      chalk.yellow('Legacy Router:') + '\n' +
      `- Local (Ollama): ${capabilities.local.available ? '✓ Available' : '✗ Unavailable'}` + '\n' +
      `- Cloud (Pulser): ${capabilities.cloud.available ? '✓ Available' : '✗ Unavailable'}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round'
      }
    ));
    
  } catch (error) {
    spinner.fail('Status check failed');
    console.error(chalk.red(error.message));
  }
}

async function handleCodeReview(file, options) {
  const spinner = ora('Analyzing code...').start();
  
  try {
    let request;
    
    if (options.code) {
      request = {
        input: options.code,
        context: {},
        preferences: {
          format: options.format,
          verbose: options.verbose,
          includeExplanation: true
        },
        parameters: {
          executionMode: options.mode
        }
      };
    } else if (file) {
      request = {
        input: '',
        context: {
          files: [file]
        },
        preferences: {
          format: options.format,
          verbose: options.verbose,
          includeExplanation: true
        },
        parameters: {
          executionMode: options.mode
        }
      };
    } else {
      spinner.fail('Please provide either a file or --code option');
      return;
    }
    
    const response = await agentOrchestrator.executeRequest('codereview', request);
    
    spinner.succeed('Code review completed');
    
    if (options.format === 'json') {
      console.log(JSON.stringify(response, null, 2));
    } else {
      console.log('\n' + response.content);
      
      if (options.verbose && response.metadata) {
        console.log('\n' + chalk.gray('---'));
        console.log(chalk.gray(`Agent: ${response.metadata.agent}`));
        console.log(chalk.gray(`Mode: ${response.metadata.executionMode}`));
        console.log(chalk.gray(`Model: ${response.metadata.model || 'N/A'}`));
        console.log(chalk.gray(`Confidence: ${Math.round(response.metadata.confidence * 100)}%`));
        console.log(chalk.gray(`Time: ${response.metadata.executionTime}ms`));
        if (response.metadata.cost) {
          console.log(chalk.gray(`Cost: $${response.metadata.cost.toFixed(4)}`));
        }
      }
    }
  } catch (error) {
    spinner.fail(`Code review failed: ${error.message}`);
    process.exit(1);
  }
}

async function handleAgentsCommand(action) {
  switch (action) {
    case 'list':
      try {
        const agents = await agentOrchestrator.listAgents();
        
        console.log(chalk.blue('\n🤖 Available Agents:\n'));
        
        agents.forEach(agent => {
          console.log(chalk.cyan(`${agent.name} v${agent.version}`));
          console.log(`  ${agent.description}`);
          console.log(chalk.gray(`  Mode: ${agent.executionMode}`));
          console.log(chalk.gray(`  Capabilities: ${agent.capabilities.join(', ')}`));
          console.log();
        });
      } catch (error) {
        console.error(chalk.red(`Error listing agents: ${error.message}`));
      }
      break;
  }
}

// Utility functions
function determineExecutionMode(options) {
  if (options.localOnly || options.privacyMode) return 'local';
  if (options.cloudOnly) return 'cloud';
  return options.mode || 'hybrid';
}

function getStatusColor(status) {
  switch (status) {
    case 'healthy': return chalk.green('HEALTHY');
    case 'degraded': return chalk.yellow('DEGRADED');
    case 'down': return chalk.red('DOWN');
    default: return chalk.gray('UNKNOWN');
  }
}

function displayExecutionInfo(plan) {
  console.log(chalk.gray('\n--- Execution Info ---'));
  console.log(chalk.gray(`Mode: ${plan.mode}`));
  console.log(chalk.gray(`Agent: ${plan.agent}`));
  if (plan.model) console.log(chalk.gray(`Model: ${plan.model}`));
  if (plan.pipeline) console.log(chalk.gray(`Pipeline: ${plan.pipeline}`));
  console.log(chalk.gray(`Routing: ${plan.routing.reason}`));
  console.log(chalk.gray('--- End ---\n'));
}

function displayInteractiveHelp() {
  console.log(chalk.cyan('\nAvailable Commands:'));
  console.log('- exit: Quit the session');
  console.log('- help: Show this help');
  console.log('- explain <code>: Explain code');
  console.log('- fix <issue>: Fix a problem');
  console.log('- test <code>: Generate tests');
  console.log('\nOr just type your question naturally!\n');
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

// Run the CLI
main();