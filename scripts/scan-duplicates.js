#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const DEFAULT_THRESHOLD = 0.8;
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.next/,
  /coverage/,
  /\.env/,
  /package-lock\.json/,
  /pnpm-lock\.yaml/,
  /yarn\.lock/
];

const FILE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.yaml', '.yml'];

class DuplicateScanner {
  constructor(options = {}) {
    this.threshold = options.threshold || DEFAULT_THRESHOLD;
    this.tenantSlug = options.tenant;
    this.outputFile = options.output;
    this.fileHashes = new Map();
    this.duplicates = [];
  }

  shouldIgnoreFile(filePath) {
    return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
  }

  getFileHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  calculateSimilarity(content1, content2) {
    const lines1 = content1.split('\n').filter(line => line.trim().length > 0);
    const lines2 = content2.split('\n').filter(line => line.trim().length > 0);
    
    const set1 = new Set(lines1);
    const set2 = new Set(lines2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  scanDirectory(dirPath) {
    const files = [];
    
    function walk(currentPath) {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (stat.isFile() && FILE_EXTENSIONS.includes(path.extname(item))) {
          files.push(fullPath);
        }
      }
    }
    
    walk(dirPath);
    return files;
  }

  async scanForDuplicates() {
    const rootDir = this.tenantSlug 
      ? path.join(process.cwd(), 'tenants', this.tenantSlug)
      : process.cwd();

    if (!fs.existsSync(rootDir)) {
      throw new Error(`Directory not found: ${rootDir}`);
    }

    console.log(`🔍 Scanning for duplicates in: ${rootDir}`);
    console.log(`📊 Similarity threshold: ${this.threshold}`);

    const files = this.scanDirectory(rootDir)
      .filter(file => !this.shouldIgnoreFile(file));

    console.log(`📁 Found ${files.length} files to analyze`);

    // Group files by hash for exact duplicates
    const exactDuplicates = new Map();
    
    // Track content for similarity analysis
    const fileContents = new Map();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const hash = this.getFileHash(content);
        
        fileContents.set(file, content);
        
        if (exactDuplicates.has(hash)) {
          exactDuplicates.get(hash).push(file);
        } else {
          exactDuplicates.set(hash, [file]);
        }
      } catch (error) {
        console.warn(`⚠️  Could not read file: ${file}`);
      }
    }

    // Report exact duplicates
    for (const [hash, duplicateFiles] of exactDuplicates) {
      if (duplicateFiles.length > 1) {
        this.duplicates.push({
          type: 'exact',
          similarity: 1.0,
          files: duplicateFiles,
          hash: hash
        });
      }
    }

    // Find similar files (not exact duplicates)
    const processedPairs = new Set();
    const fileList = Array.from(fileContents.keys());

    for (let i = 0; i < fileList.length; i++) {
      for (let j = i + 1; j < fileList.length; j++) {
        const file1 = fileList[i];
        const file2 = fileList[j];
        const pairKey = [file1, file2].sort().join('|');
        
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        // Skip if already exact duplicates
        const hash1 = this.getFileHash(fileContents.get(file1));
        const hash2 = this.getFileHash(fileContents.get(file2));
        if (hash1 === hash2) continue;

        const similarity = this.calculateSimilarity(
          fileContents.get(file1),
          fileContents.get(file2)
        );

        if (similarity >= this.threshold) {
          this.duplicates.push({
            type: 'similar',
            similarity: similarity,
            files: [file1, file2]
          });
        }
      }
    }

    return this.duplicates;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      tenant: this.tenantSlug || 'all',
      threshold: this.threshold,
      summary: {
        totalDuplicates: this.duplicates.length,
        exactDuplicates: this.duplicates.filter(d => d.type === 'exact').length,
        similarFiles: this.duplicates.filter(d => d.type === 'similar').length
      },
      duplicates: this.duplicates
    };

    if (this.outputFile) {
      const outputDir = path.dirname(this.outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(this.outputFile, JSON.stringify(report, null, 2));
      console.log(`📄 Report saved to: ${this.outputFile}`);
    }

    return report;
  }

  printSummary(report) {
    console.log('\n📊 DUPLICATE SCAN RESULTS');
    console.log('=' .repeat(50));
    console.log(`🎯 Tenant: ${report.tenant}`);
    console.log(`📈 Threshold: ${report.threshold}`);
    console.log(`🔍 Total Issues: ${report.summary.totalDuplicates}`);
    console.log(`💯 Exact Duplicates: ${report.summary.exactDuplicates}`);
    console.log(`🔀 Similar Files: ${report.summary.similarFiles}`);

    if (report.duplicates.length > 0) {
      console.log('\n📋 DETAILED FINDINGS:');
      
      report.duplicates.forEach((duplicate, index) => {
        console.log(`\n${index + 1}. ${duplicate.type.toUpperCase()} (${(duplicate.similarity * 100).toFixed(1)}%)`);
        duplicate.files.forEach(file => {
          console.log(`   📁 ${path.relative(process.cwd(), file)}`);
        });
      });
    } else {
      console.log('\n✅ No duplicates found!');
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--tenant=')) {
      options.tenant = arg.split('=')[1];
    } else if (arg.startsWith('--threshold=')) {
      options.threshold = parseFloat(arg.split('=')[1]);
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    }
  }

  try {
    const scanner = new DuplicateScanner(options);
    await scanner.scanForDuplicates();
    const report = scanner.generateReport();
    scanner.printSummary(report);

    // Exit with error code if duplicates found
    if (report.duplicates.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}