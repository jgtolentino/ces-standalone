#!/usr/bin/env tsx

import * as fs from 'fs/promises'
import * as path from 'path'
import * as yaml from 'js-yaml'
import { JulesAgent } from '../agents/jules'
import { CoderAgent } from '../agents/coder'
import { OperatorAgent } from '../agents/operator'

interface WorkflowStep {
  name: string
  type: 'analyze' | 'generate' | 'fix' | 'execute'
  description: string
  prompt: string
  timeout?: number
}

interface Workflow {
  name: string
  description: string
  version: string
  triggers: string[]
  parameters?: Array<{
    name: string
    description: string
    required: boolean
    default?: string
  }>
  steps: WorkflowStep[]
  outputs?: Array<{
    type: string
    filename?: string
    directory?: string
  }>
  settings?: {
    parallel?: boolean
    continueOnError?: boolean
    saveResults?: boolean
    createDirectory?: boolean
  }
}

interface WorkflowContext {
  parameters: Record<string, string>
  variables: Record<string, any>
  results: Record<string, any>
  workingDir: string
}

class WorkflowRunner {
  private jules: JulesAgent
  private coder: CoderAgent
  private operator: OperatorAgent
  private workflowsDir: string

  constructor(workflowsDir: string = './workflows') {
    this.jules = new JulesAgent()
    this.coder = new CoderAgent()
    this.operator = new OperatorAgent()
    this.workflowsDir = workflowsDir
  }

  async listWorkflows(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.workflowsDir)
      return files
        .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
        .map(file => path.basename(file, path.extname(file)))
    } catch (error) {
      console.error('Failed to list workflows:', error)
      return []
    }
  }

  async loadWorkflow(name: string): Promise<Workflow | null> {
    try {
      const workflowPath = path.join(this.workflowsDir, `${name}.yml`)
      
      // Try .yml first, then .yaml
      let content: string
      try {
        content = await fs.readFile(workflowPath, 'utf-8')
      } catch {
        const yamlPath = path.join(this.workflowsDir, `${name}.yaml`)
        content = await fs.readFile(yamlPath, 'utf-8')
      }

      const workflow = yaml.load(content) as Workflow
      return workflow
    } catch (error) {
      console.error(`Failed to load workflow ${name}:`, error)
      return null
    }
  }

  async runWorkflow(
    name: string, 
    parameters: Record<string, string> = {},
    workingDir: string = process.cwd()
  ): Promise<boolean> {
    const workflow = await this.loadWorkflow(name)
    if (!workflow) {
      console.error(`Workflow ${name} not found`)
      return false
    }

    console.log(`🚀 Starting workflow: ${workflow.name}`)
    console.log(`📝 ${workflow.description}\n`)

    // Initialize context
    const context: WorkflowContext = {
      parameters: { ...parameters },
      variables: {},
      results: {},
      workingDir
    }

    // Set default parameters
    if (workflow.parameters) {
      for (const param of workflow.parameters) {
        if (!(param.name in context.parameters)) {
          if (param.required && !param.default) {
            console.error(`❌ Required parameter missing: ${param.name}`)
            return false
          }
          if (param.default) {
            context.parameters[param.name] = param.default
          }
        }
      }
    }

    // Create output directory if needed
    if (workflow.settings?.createDirectory) {
      const outputDir = path.join(workingDir, 'workflow-output')
      await this.operator.createDirectory(outputDir)
    }

    try {
      // Execute steps
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i]
        console.log(`📋 Step ${i + 1}/${workflow.steps.length}: ${step.name}`)
        
        const success = await this.executeStep(step, context)
        
        if (!success) {
          if (workflow.settings?.continueOnError) {
            console.log(`⚠️  Step failed but continuing due to continueOnError setting`)
            continue
          } else {
            console.error(`❌ Workflow failed at step: ${step.name}`)
            return false
          }
        }
        
        console.log(`✅ Completed: ${step.name}\n`)
      }

      // Generate outputs
      if (workflow.outputs && workflow.settings?.saveResults) {
        await this.generateOutputs(workflow.outputs, context)
      }

      console.log(`🎉 Workflow completed successfully: ${workflow.name}`)
      return true

    } catch (error) {
      console.error(`❌ Workflow execution failed:`, error)
      return false
    }
  }

  private async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<boolean> {
    try {
      // Replace variables in prompt
      const prompt = this.interpolateVariables(step.prompt, context)
      
      let result: string

      switch (step.type) {
        case 'analyze':
          result = await this.jules.executeTask({
            id: `step_${Date.now()}`,
            type: 'analyze',
            description: step.description,
            priority: 'medium',
            status: 'pending'
          }, context)
          break

        case 'generate':
          result = await this.jules.executeTask({
            id: `step_${Date.now()}`,
            type: 'generate',
            description: step.description,
            priority: 'medium',
            status: 'pending'
          }, context)
          break

        case 'fix':
          result = await this.jules.executeTask({
            id: `step_${Date.now()}`,
            type: 'fix',
            description: step.description,
            priority: 'medium',
            status: 'pending'
          }, context)
          break

        case 'execute':
          const shellResult = await this.operator.executeShell(prompt)
          result = shellResult.success ? shellResult.output : `Error: ${shellResult.error}`
          break

        default:
          throw new Error(`Unknown step type: ${step.type}`)
      }

      // Store result in context
      context.results[step.name] = result
      context.variables[this.camelCase(step.name)] = result

      return true

    } catch (error) {
      console.error(`Step execution failed:`, error)
      return false
    }
  }

  private interpolateVariables(text: string, context: WorkflowContext): string {
    let result = text

    // Replace parameters: {paramName}
    for (const [key, value] of Object.entries(context.parameters)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }

    // Replace variables: {{variableName}}
    for (const [key, value] of Object.entries(context.variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
    }

    return result
  }

  private async generateOutputs(
    outputs: Workflow['outputs'], 
    context: WorkflowContext
  ): Promise<void> {
    if (!outputs) return

    for (const output of outputs) {
      try {
        let content = ''
        let filename = output.filename || `output-${Date.now()}.txt`

        switch (output.type) {
          case 'report':
            content = this.generateReport(context)
            break
          case 'suggestions':
            content = this.generateSuggestions(context)
            break
          case 'documentation':
            content = this.generateDocumentation(context)
            break
          case 'architecture':
            content = this.generateArchitecture(context)
            break
          case 'api-docs':
            content = this.generateAPIDocs(context)
            break
          default:
            content = JSON.stringify(context.results, null, 2)
        }

        const outputPath = output.directory ? 
          path.join(context.workingDir, output.directory, filename) :
          path.join(context.workingDir, filename)

        await this.operator.writeFile(outputPath, content)
        console.log(`📄 Generated output: ${outputPath}`)

      } catch (error) {
        console.error(`Failed to generate output ${output.type}:`, error)
      }
    }
  }

  private generateReport(context: WorkflowContext): string {
    let report = `# Workflow Report\n\n`
    report += `Generated: ${new Date().toISOString()}\n\n`
    
    report += `## Parameters\n\n`
    for (const [key, value] of Object.entries(context.parameters)) {
      report += `- **${key}**: ${value}\n`
    }
    
    report += `\n## Results\n\n`
    for (const [step, result] of Object.entries(context.results)) {
      report += `### ${step}\n\n`
      report += `${result}\n\n`
    }
    
    return report
  }

  private generateSuggestions(context: WorkflowContext): string {
    let suggestions = `# Improvement Suggestions\n\n`
    
    // Extract suggestions from results
    for (const [step, result] of Object.entries(context.results)) {
      if (typeof result === 'string' && result.toLowerCase().includes('suggest')) {
        suggestions += `## From ${step}\n\n`
        suggestions += `${result}\n\n`
      }
    }
    
    return suggestions
  }

  private generateDocumentation(context: WorkflowContext): string {
    let docs = `# Project Documentation\n\n`
    
    for (const [step, result] of Object.entries(context.results)) {
      docs += `## ${step}\n\n`
      docs += `${result}\n\n`
    }
    
    return docs
  }

  private generateArchitecture(context: WorkflowContext): string {
    let arch = `# Architecture Overview\n\n`
    
    for (const [step, result] of Object.entries(context.results)) {
      if (step.toLowerCase().includes('architecture') || step.toLowerCase().includes('structure')) {
        arch += `${result}\n\n`
      }
    }
    
    return arch
  }

  private generateAPIDocs(context: WorkflowContext): string {
    let docs = `# API Documentation\n\n`
    
    for (const [step, result] of Object.entries(context.results)) {
      if (step.toLowerCase().includes('api') || step.toLowerCase().includes('endpoint')) {
        docs += `${result}\n\n`
      }
    }
    
    return docs
  }

  private camelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map((word, index) => 
        index === 0 ? word.toLowerCase() : 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('')
  }
}

// CLI Interface
async function main() {
  const runner = new WorkflowRunner()
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Claude-Jules Workflow Runner\n')
    console.log('Usage:')
    console.log('  npm run workflow list                    # List available workflows')
    console.log('  npm run workflow run <name>              # Run workflow')
    console.log('  npm run workflow run <name> key=value    # Run with parameters')
    console.log('')
    
    const workflows = await runner.listWorkflows()
    if (workflows.length > 0) {
      console.log('Available workflows:')
      workflows.forEach(workflow => console.log(`  - ${workflow}`))
    }
    return
  }

  const command = args[0]

  if (command === 'list') {
    const workflows = await runner.listWorkflows()
    console.log('Available workflows:')
    workflows.forEach(workflow => console.log(`  - ${workflow}`))
    return
  }

  if (command === 'run') {
    const workflowName = args[1]
    if (!workflowName) {
      console.error('Please specify a workflow name')
      return
    }

    // Parse parameters
    const parameters: Record<string, string> = {}
    for (let i = 2; i < args.length; i++) {
      const [key, value] = args[i].split('=')
      if (key && value) {
        parameters[key] = value
      }
    }

    const success = await runner.runWorkflow(workflowName, parameters)
    process.exit(success ? 0 : 1)
  }

  console.error(`Unknown command: ${command}`)
  process.exit(1)
}

if (require.main === module) {
  main().catch(console.error)
}

export { WorkflowRunner }