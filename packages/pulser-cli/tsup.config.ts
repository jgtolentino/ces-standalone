import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['core/*.ts', 'agents/*.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['ollama', 'chalk', 'ora', 'boxen', 'inquirer', 'commander'],
  splitting: false,
  treeshake: true,
});