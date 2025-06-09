/**
 * Prompt Usage Examples
 * Shows how to use the refined prompt system
 */

import { getSystemPrompt, PromptFactory } from '../prompts/prompt-factory';

// Example 1: Basic chat prompt for CES
const cesChat = getSystemPrompt('ces', 'chat');
console.log('CES Chat Prompt:', cesChat);

// Example 2: API prompt for Retail with regional focus
const retailAPI = getSystemPrompt('retail-insights', 'api', {
  region: 'Luzon',
  userRole: 'Brand Manager'
});

// Example 3: Dashboard prompt with custom constraints
const cesDashboard = getSystemPrompt('ces', 'dashboard', {
  customConstraints: [
    'Focus on Q4 performance only',
    'Exclude test campaigns',
    'Highlight budget overspend risks'
  ]
});

// Example 4: A/B test different variations
const conversationalPrompt = PromptFactory.generateVariation('retail-insights', 'chat', 'conversational');
const concisePrompt = PromptFactory.generateVariation('retail-insights', 'chat', 'concise');

// Example 5: Cross-tenant access (CES primary, Retail secondary)
const crossTenantPrompt = PromptFactory.generateCrossTenanxtsPrompt(
  'ces',
  ['retail-insights'],
  'chat'
);

// Example 6: Schema-only prompt for SQL generation
const schemaPrompt = PromptFactory.getSchemaPrompt('ces');

export const promptExamples = {
  cesChat,
  retailAPI,
  cesDashboard,
  conversationalPrompt,
  concisePrompt,
  crossTenantPrompt,
  schemaPrompt
};