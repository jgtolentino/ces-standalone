import * as fs from 'fs/promises'
import * as path from 'path'

export interface FileInfo {
  path: string
  name: string
  extension: string
  size: number
  language: string
  lastModified: number
}

export interface CodeStructure {
  functions: Array<{
    name: string
    line: number
    type: 'function' | 'method' | 'class' | 'interface'
  }>
  imports: string[]
  exports: string[]
  dependencies: string[]
}

export interface ProjectAnalysis {
  files: FileInfo[]
  languages: Record<string, number>
  structure: Record<string, CodeStructure>
  dependencies: string[]
  totalLines: number
  summary: string
}

export class CodebaseAnalyzer {
  private excludePatterns = [
    /node_modules/,
    /\.git/,
    /\.next/,
    /dist/,
    /build/,
    /coverage/,
    /\.DS_Store/,
    /\.env/
  ]

  private languageMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.php': 'php',
    '.rb': 'ruby',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.less': 'less',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.xml': 'xml',
    '.md': 'markdown',
    '.sql': 'sql',
    '.sh': 'shell',
    '.bat': 'batch',
    '.ps1': 'powershell'
  }

  async analyzeProject(rootPath: string): Promise<ProjectAnalysis> {
    const files = await this.scanFiles(rootPath)
    const languages = this.analyzeLanguages(files)
    const structure = await this.analyzeStructure(files, rootPath)
    const dependencies = await this.extractDependencies(rootPath)
    const totalLines = await this.countTotalLines(files, rootPath)
    const summary = this.generateSummary(files, languages, dependencies)

    return {
      files,
      languages,
      structure,
      dependencies,
      totalLines,
      summary
    }
  }

  private async scanFiles(rootPath: string, currentPath = ''): Promise<FileInfo[]> {
    const files: FileInfo[] = []
    const fullPath = path.join(rootPath, currentPath)

    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name)
        const fullEntryPath = path.join(rootPath, entryPath)
        
        // Skip excluded patterns
        if (this.excludePatterns.some(pattern => pattern.test(entryPath))) {
          continue
        }

        if (entry.isDirectory()) {
          const subFiles = await this.scanFiles(rootPath, entryPath)
          files.push(...subFiles)
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullEntryPath)
          const extension = path.extname(entry.name).toLowerCase()
          
          files.push({
            path: entryPath,
            name: entry.name,
            extension,
            size: stats.size,
            language: this.languageMap[extension] || 'text',
            lastModified: stats.mtime.getTime()
          })
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }

    return files
  }

  private analyzeLanguages(files: FileInfo[]): Record<string, number> {
    const languages: Record<string, number> = {}
    
    for (const file of files) {
      if (file.language !== 'text') {
        languages[file.language] = (languages[file.language] || 0) + 1
      }
    }

    return languages
  }

  private async analyzeStructure(files: FileInfo[], rootPath: string): Promise<Record<string, CodeStructure>> {
    const structure: Record<string, CodeStructure> = {}

    for (const file of files) {
      if (this.isCodeFile(file)) {
        try {
          const content = await fs.readFile(path.join(rootPath, file.path), 'utf-8')
          structure[file.path] = this.parseCodeStructure(content, file.language)
        } catch (error) {
          // Skip files we can't read
        }
      }
    }

    return structure
  }

  private isCodeFile(file: FileInfo): boolean {
    const codeLanguages = [
      'typescript', 'javascript', 'python', 'java', 'cpp', 'c', 'csharp',
      'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala'
    ]
    return codeLanguages.includes(file.language)
  }

  private parseCodeStructure(content: string, language: string): CodeStructure {
    const functions: CodeStructure['functions'] = []
    const imports: string[] = []
    const exports: string[] = []
    const dependencies: string[] = []

    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Parse based on language
      if (language === 'typescript' || language === 'javascript') {
        this.parseJavaScriptLine(line, i + 1, functions, imports, exports, dependencies)
      } else if (language === 'python') {
        this.parsePythonLine(line, i + 1, functions, imports, exports, dependencies)
      }
      // Add more language parsers as needed
    }

    return { functions, imports, exports, dependencies }
  }

  private parseJavaScriptLine(
    line: string, 
    lineNumber: number, 
    functions: CodeStructure['functions'],
    imports: string[],
    exports: string[],
    dependencies: string[]
  ): void {
    // Function declarations
    const functionMatch = line.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=.*?(?:function|\()|class\s+(\w+)|interface\s+(\w+))/i)
    if (functionMatch) {
      const name = functionMatch[1] || functionMatch[2] || functionMatch[3] || functionMatch[4]
      const type = line.includes('class') ? 'class' : 
                   line.includes('interface') ? 'interface' : 
                   'function'
      functions.push({ name, line: lineNumber, type })
    }

    // Imports
    const importMatch = line.match(/import.*?from\s+['"]([^'"]+)['"]/i)
    if (importMatch) {
      imports.push(importMatch[1])
      if (!importMatch[1].startsWith('.')) {
        dependencies.push(importMatch[1])
      }
    }

    // Exports
    const exportMatch = line.match(/export\s+(?:default\s+)?(?:function\s+)?(\w+)/i)
    if (exportMatch) {
      exports.push(exportMatch[1])
    }
  }

  private parsePythonLine(
    line: string, 
    lineNumber: number, 
    functions: CodeStructure['functions'],
    imports: string[],
    exports: string[],
    dependencies: string[]
  ): void {
    // Function/class definitions
    const defMatch = line.match(/^(?:def\s+(\w+)|class\s+(\w+))/i)
    if (defMatch) {
      const name = defMatch[1] || defMatch[2]
      const type = defMatch[2] ? 'class' : 'function'
      functions.push({ name, line: lineNumber, type })
    }

    // Imports
    const importMatch = line.match(/(?:import\s+(\w+)|from\s+(\w+)\s+import)/i)
    if (importMatch) {
      const module = importMatch[1] || importMatch[2]
      imports.push(module)
      dependencies.push(module)
    }
  }

  private async extractDependencies(rootPath: string): Promise<string[]> {
    const dependencies: string[] = []

    try {
      // Check package.json
      const packagePath = path.join(rootPath, 'package.json')
      const packageData = await fs.readFile(packagePath, 'utf-8')
      const packageJson = JSON.parse(packageData)
      
      if (packageJson.dependencies) {
        dependencies.push(...Object.keys(packageJson.dependencies))
      }
      if (packageJson.devDependencies) {
        dependencies.push(...Object.keys(packageJson.devDependencies))
      }
    } catch (error) {
      // No package.json or can't read it
    }

    try {
      // Check requirements.txt
      const reqPath = path.join(rootPath, 'requirements.txt')
      const reqData = await fs.readFile(reqPath, 'utf-8')
      const pythonDeps = reqData
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('==')[0].split('>=')[0].split('<=')[0])
      
      dependencies.push(...pythonDeps)
    } catch (error) {
      // No requirements.txt or can't read it
    }

    return [...new Set(dependencies)]
  }

  private async countTotalLines(files: FileInfo[], rootPath: string): Promise<number> {
    let totalLines = 0

    for (const file of files) {
      if (this.isCodeFile(file)) {
        try {
          const content = await fs.readFile(path.join(rootPath, file.path), 'utf-8')
          totalLines += content.split('\n').length
        } catch (error) {
          // Skip files we can't read
        }
      }
    }

    return totalLines
  }

  private generateSummary(
    files: FileInfo[], 
    languages: Record<string, number>, 
    dependencies: string[]
  ): string {
    const totalFiles = files.length
    const primaryLanguage = Object.keys(languages).reduce((a, b) => 
      languages[a] > languages[b] ? a : b, Object.keys(languages)[0]
    )
    
    const projectType = this.inferProjectType(languages, dependencies)
    
    return `This is a ${projectType} project with ${totalFiles} files, primarily written in ${primaryLanguage}. ` +
           `The project uses ${dependencies.length} dependencies including ${dependencies.slice(0, 3).join(', ')}.`
  }

  private inferProjectType(languages: Record<string, number>, dependencies: string[]): string {
    if (dependencies.includes('next') || dependencies.includes('react')) {
      return 'React/Next.js web application'
    }
    if (dependencies.includes('express') || dependencies.includes('fastify')) {
      return 'Node.js backend application'
    }
    if (dependencies.includes('django') || dependencies.includes('flask')) {
      return 'Python web application'
    }
    if (languages.typescript || languages.javascript) {
      return 'JavaScript/TypeScript application'
    }
    if (languages.python) {
      return 'Python application'
    }
    if (languages.java) {
      return 'Java application'
    }
    
    return 'software'
  }
}