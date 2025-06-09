import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'core/*.ts', 
    'agents/BaseAgent.ts',
    'agents/CloudExecutor.ts',
    'agents/HybridExecutor.ts',
    'agents/LocalExecutor.ts',
    'agents/index.ts'
  ],
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  external: ['ollama', 'chalk', 'ora', 'boxen', 'inquirer', 'commander'],
  splitting: false,
  treeshake: true,
});