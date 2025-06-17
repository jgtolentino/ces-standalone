import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'

const execAsync = promisify(exec)

export interface OperationResult {
  success: boolean
  output: string
  error?: string
  exitCode?: number
}

export interface GitResult extends OperationResult {
  branch?: string
  commits?: string[]
  files?: string[]
}

export class OperatorAgent {
  private workingDir: string

  constructor(workingDir: string = process.cwd()) {
    this.workingDir = workingDir
  }

  async executeShell(command: string, options: { timeout?: number } = {}): Promise<OperationResult> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workingDir,
        timeout: options.timeout || 30000,
        maxBuffer: 1024 * 1024 // 1MB buffer
      })

      return {
        success: true,
        output: stdout.trim(),
        error: stderr.trim() || undefined,
        exitCode: 0
      }
    } catch (error: any) {
      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message,
        exitCode: error.code || 1
      }
    }
  }

  async runNpmScript(script: string): Promise<OperationResult> {
    return await this.executeShell(`npm run ${script}`)
  }

  async installPackage(packageName: string, dev: boolean = false): Promise<OperationResult> {
    const flag = dev ? '--save-dev' : '--save'
    return await this.executeShell(`npm install ${flag} ${packageName}`)
  }

  async gitStatus(): Promise<GitResult> {
    const result = await this.executeShell('git status --porcelain')
    if (!result.success) {
      return { ...result }
    }

    const files = result.output
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.substring(3)) // Remove status prefix

    const branchResult = await this.executeShell('git branch --show-current')
    const branch = branchResult.success ? branchResult.output : 'unknown'

    return {
      ...result,
      branch,
      files
    }
  }

  async gitAdd(files: string[] = ['.']): Promise<OperationResult> {
    const fileList = files.join(' ')
    return await this.executeShell(`git add ${fileList}`)
  }

  async gitCommit(message: string): Promise<OperationResult> {
    const escapedMessage = message.replace(/"/g, '\\"')
    return await this.executeShell(`git commit -m "${escapedMessage}"`)
  }

  async gitPush(remote: string = 'origin', branch?: string): Promise<OperationResult> {
    if (!branch) {
      const branchResult = await this.executeShell('git branch --show-current')
      branch = branchResult.success ? branchResult.output : 'main'
    }
    return await this.executeShell(`git push ${remote} ${branch}`)
  }

  async gitPull(remote: string = 'origin', branch?: string): Promise<OperationResult> {
    if (!branch) {
      const branchResult = await this.executeShell('git branch --show-current')
      branch = branchResult.success ? branchResult.output : 'main'
    }
    return await this.executeShell(`git pull ${remote} ${branch}`)
  }

  async createBranch(branchName: string, checkout: boolean = true): Promise<OperationResult> {
    const command = checkout ? 
      `git checkout -b ${branchName}` : 
      `git branch ${branchName}`
    return await this.executeShell(command)
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const fullPath = path.resolve(this.workingDir, filePath)
      return await fs.readFile(fullPath, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`)
    }
  }

  async writeFile(filePath: string, content: string): Promise<OperationResult> {
    try {
      const fullPath = path.resolve(this.workingDir, filePath)
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content, 'utf-8')
      
      return {
        success: true,
        output: `File written: ${filePath}`
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: `Failed to write file ${filePath}: ${error}`
      }
    }
  }

  async listFiles(directory: string = '.', recursive: boolean = false): Promise<string[]> {
    try {
      const fullPath = path.resolve(this.workingDir, directory)
      
      if (recursive) {
        const result = await this.executeShell(`find "${fullPath}" -type f`)
        return result.success ? 
          result.output.split('\n').filter(line => line.trim()) : 
          []
      } else {
        const entries = await fs.readdir(fullPath, { withFileTypes: true })
        return entries
          .filter(entry => entry.isFile())
          .map(entry => entry.name)
      }
    } catch (error) {
      return []
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.resolve(this.workingDir, filePath)
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  async createDirectory(dirPath: string): Promise<OperationResult> {
    try {
      const fullPath = path.resolve(this.workingDir, dirPath)
      await fs.mkdir(fullPath, { recursive: true })
      
      return {
        success: true,
        output: `Directory created: ${dirPath}`
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: `Failed to create directory ${dirPath}: ${error}`
      }
    }
  }

  async startDevelopmentServer(command: string = 'npm run dev'): Promise<OperationResult> {
    return new Promise((resolve) => {
      const child = spawn(command.split(' ')[0], command.split(' ').slice(1), {
        cwd: this.workingDir,
        stdio: 'pipe'
      })

      let output = ''
      let errorOutput = ''

      child.stdout?.on('data', (data) => {
        output += data.toString()
        // Check for common dev server ready messages
        if (output.includes('Local:') || output.includes('ready') || output.includes('started')) {
          resolve({
            success: true,
            output: output.trim()
          })
        }
      })

      child.stderr?.on('data', (data) => {
        errorOutput += data.toString()
      })

      child.on('error', (error) => {
        resolve({
          success: false,
          output: output.trim(),
          error: error.message
        })
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        child.kill()
        resolve({
          success: false,
          output: output.trim(),
          error: 'Development server start timeout'
        })
      }, 30000)
    })
  }

  setWorkingDirectory(dir: string): void {
    this.workingDir = path.resolve(dir)
  }

  getWorkingDirectory(): string {
    return this.workingDir
  }
}