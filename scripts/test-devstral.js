#!/usr/bin/env node

/**
 * Devstral Integration Test Script
 * Tests the new Devstral model with various coding tasks
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Test prompts for different capabilities
const testPrompts = [
  {
    name: "Simple Code Generation",
    prompt: "Write a TypeScript function to calculate factorial of a number",
    expectedKeywords: ["function", "typescript", "factorial"]
  },
  {
    name: "Code Review",
    prompt: "Review this code and suggest improvements: function add(a,b){return a+b}",
    expectedKeywords: ["type", "parameter", "improvement"]
  },
  {
    name: "Architecture Question",
    prompt: "Explain the benefits of microservices vs monolithic architecture",
    expectedKeywords: ["microservices", "scalability", "deployment"]
  },
  {
    name: "Debug Help",
    prompt: "Find the bug in this code: const arr = [1,2,3]; arr.forEach((item, i) => { arr[i+1] = item * 2; });",
    expectedKeywords: ["index", "bounds", "mutation"]
  }
];

async function testModel(modelName, prompt) {
  try {
    console.log(`\n🧪 Testing ${modelName}...`);
    console.log(`📝 Prompt: "${prompt.substring(0, 50)}..."`);
    
    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(`ollama run ${modelName} "${prompt}"`);
    const duration = Date.now() - startTime;
    
    if (stderr && stderr.trim()) {
      console.log(`⚠️  Warning: ${stderr.trim()}`);
    }
    
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📤 Response: ${stdout.substring(0, 200)}...`);
    
    return {
      model: modelName,
      prompt,
      response: stdout,
      duration,
      success: true
    };
  } catch (error) {
    console.log(`❌ Error testing ${modelName}: ${error.message}`);
    return {
      model: modelName,
      prompt,
      error: error.message,
      success: false
    };
  }
}

async function checkModelAvailability(modelName) {
  try {
    const { stdout } = await execAsync('ollama list');
    return stdout.includes(modelName);
  } catch (error) {
    console.log(`❌ Error checking model availability: ${error.message}`);
    return false;
  }
}

async function compareModels() {
  console.log('🚀 Starting Devstral Integration Test Suite\n');
  
  // Check which models are available
  const models = ['devstral:latest', 'deepseek-coder:6.7b-instruct-q4_K_M', 'codellama:7b-code'];
  const availableModels = [];
  
  for (const model of models) {
    const isAvailable = await checkModelAvailability(model);
    if (isAvailable) {
      availableModels.push(model);
      console.log(`✅ ${model} is available`);
    } else {
      console.log(`❌ ${model} is not available`);
    }
  }
  
  if (availableModels.length === 0) {
    console.log('❌ No models available for testing');
    return;
  }
  
  console.log(`\n🎯 Testing ${availableModels.length} models with ${testPrompts.length} prompts\n`);
  
  const results = [];
  
  // Test each available model with each prompt
  for (const prompt of testPrompts) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TEST: ${prompt.name}`);
    console.log(`${'='.repeat(60)}`);
    
    for (const model of availableModels) {
      const result = await testModel(model, prompt.prompt);
      results.push({ ...result, testName: prompt.name });
      
      // Add delay between tests to prevent overload
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Generate summary report
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY REPORT');
  console.log(`${'='.repeat(60)}`);
  
  const summary = {};
  results.forEach(result => {
    if (!summary[result.model]) {
      summary[result.model] = {
        totalTests: 0,
        successful: 0,
        avgDuration: 0,
        durations: []
      };
    }
    
    summary[result.model].totalTests++;
    if (result.success) {
      summary[result.model].successful++;
      summary[result.model].durations.push(result.duration || 0);
    }
  });
  
  // Calculate averages
  Object.keys(summary).forEach(model => {
    const data = summary[model];
    data.avgDuration = data.durations.length > 0 
      ? Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length)
      : 0;
    data.successRate = Math.round((data.successful / data.totalTests) * 100);
  });
  
  // Display results
  console.log('\n🏆 Performance Comparison:');
  Object.entries(summary).forEach(([model, data]) => {
    console.log(`\n📋 ${model}:`);
    console.log(`   ✅ Success Rate: ${data.successRate}% (${data.successful}/${data.totalTests})`);
    console.log(`   ⏱️  Avg Response Time: ${data.avgDuration}ms`);
  });
  
  // Recommend best model
  const bestModel = Object.entries(summary).reduce((best, [model, data]) => {
    const score = (data.successRate * 0.7) + ((10000 - data.avgDuration) / 10000 * 30);
    return score > best.score ? { model, score, data } : best;
  }, { model: null, score: 0 });
  
  if (bestModel.model) {
    console.log(`\n🥇 Recommended Model: ${bestModel.model}`);
    console.log(`   Reason: Best balance of success rate (${bestModel.data.successRate}%) and speed (${bestModel.data.avgDuration}ms)`);
  }
  
  console.log('\n✅ Testing complete!');
}

// Run the comparison if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  compareModels().catch(console.error);
}

export { testModel, checkModelAvailability, compareModels };