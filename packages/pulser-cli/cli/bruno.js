#!/usr/bin/env node

// Bruno CLI - Backward compatibility wrapper for Pulser CLI
// Maintains exact Bruno CLI interface while using unified Pulser backend

import { execSync } from 'child_process';
import chalk from 'chalk';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pulserCLI = path.join(__dirname, 'pulser.js');

// Get command line arguments
const args = process.argv.slice(2);

// Bruno CLI behavior mapping
function transformBrunoArgsToPulser(args) {
  const pulserArgs = ['--privacy-mode']; // Bruno defaults to local-first
  
  // Handle Bruno-specific flags
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-c':
      case '--continue':
        pulserArgs.push('--continue');
        break;
        
      case '-r':
      case '--resume':
        pulserArgs.push('--resume', args[i + 1]);
        i++; // Skip next argument as it's the session ID
        break;
        
      case '-v':
      case '--verbose':
        pulserArgs.push('--verbose');
        break;
        
      case '--agent':
        pulserArgs.push('--agent', args[i + 1]);
        i++; // Skip next argument
        break;
        
      case '--help':
        showBrunoHelp();
        process.exit(0);
        break;
        
      case '--version':
        console.log('Bruno CLI v4.0.0 (powered by Pulser)');
        process.exit(0);
        break;
        
      default:
        // Regular arguments pass through
        pulserArgs.push(arg);
        break;
    }
  }
  
  return pulserArgs;
}

function showBrunoHelp() {
  console.log(chalk.cyan.bold('Bruno CLI v4.0.0') + chalk.gray(' (powered by Pulser)'));
  console.log(chalk.gray('Local AI CLI tool with Claude Code parity\n'));
  
  console.log(chalk.yellow('Usage:'));
  console.log('  bruno "your prompt"           # Print mode - one-shot query');
  console.log('  bruno                         # Interactive mode');
  console.log('  bruno -c                      # Continue last session');
  console.log('  bruno -r <sessionId>          # Resume specific session\n');
  
  console.log(chalk.yellow('Agent Commands:'));
  console.log('  bruno explain <file>          # Explain code');
  console.log('  bruno fix <file>              # Fix code issues');
  console.log('  bruno test <file>             # Generate tests\n');
  
  console.log(chalk.yellow('Options:'));
  console.log('  -c, --continue               # Continue last session');
  console.log('  -r, --resume <id>            # Resume specific session');
  console.log('  -v, --verbose                # Enable verbose output');
  console.log('  --agent <name>               # Use specific agent');
  console.log('  --help                       # Show this help');
  console.log('  --version                    # Show version\n');
  
  console.log(chalk.green('Examples:'));
  console.log('  bruno "explain async/await"');
  console.log('  bruno explain app.js');
  console.log('  bruno fix script.py --issue "memory leak"');
  console.log('  bruno test mymodule.js\n');
  
  console.log(chalk.blue('Note:') + ' Bruno now runs on the unified Pulser platform with local-first execution.');
}

function main() {
  try {
    // Show Bruno branding for interactive mode (no arguments)
    if (args.length === 0) {
      console.log(chalk.cyan('🤖 Bruno CLI') + chalk.gray(' (powered by Pulser v4.0)'));
      console.log(chalk.gray('Local-first AI assistant with Claude Code parity\n'));
    }
    
    // Transform Bruno arguments to Pulser arguments
    const pulserArgs = transformBrunoArgsToPulser(args);
    
    // Execute Pulser CLI with transformed arguments
    const command = `node "${pulserCLI}" ${pulserArgs.map(arg => `"${arg}"`).join(' ')}`;
    
    // Use execSync to maintain stdio inheritance and exit codes
    execSync(command, {
      stdio: 'inherit',
      encoding: 'utf8'
    });
    
  } catch (error) {
    // If Pulser CLI fails, provide Bruno-specific error handling
    if (error.status) {
      process.exit(error.status);
    } else {
      console.error(chalk.red('Bruno CLI Error:'), error.message);
      process.exit(1);
    }
  }
}

// Execute main function
main();