/**
 * Assistant Routing Examples
 * Shows how "Ask Tes" routes to RetailGenie, "Ask Ces" routes to CES-AI
 */

import { routeToAssistant, AssistantRouter } from '../assistant-router';

// Example 1: Explicit activation phrases
console.log('=== EXPLICIT ROUTING ===');

const tesQuery = routeToAssistant("Ask Tes about Alaska sales in Luzon");
console.log(`"Ask Tes" → ${tesQuery.assistant?.name}`); // RetailGenie (Tes)

const cesQuery = routeToAssistant("Ask Ces for campaign ROI analysis");  
console.log(`"Ask Ces" → ${cesQuery.assistant?.name}`); // CES-AI (Ces)

const scoutQuery = routeToAssistant("Ask Scout about brand mentions");
console.log(`"Ask Scout" → ${scoutQuery.assistant?.name}`); // Scout

// Example 2: Smart routing based on content
console.log('\n=== SMART ROUTING ===');

const retailQuery = routeToAssistant("Show me Oishi sales performance in Mindanao stores");
console.log(`Retail content → ${retailQuery.assistant?.name}`); // RetailGenie (Tes)

const campaignQuery = routeToAssistant("What's the ROAS for our digital campaigns?");
console.log(`Campaign content → ${campaignQuery.assistant?.name}`); // CES-AI (Ces)

const socialQuery = routeToAssistant("Monitor sentiment for our brand on social media");
console.log(`Social content → ${socialQuery.assistant?.name}`); // Scout

// Example 3: No clear routing
const ambiguousQuery = routeToAssistant("Hello, how are you?");
console.log(`Ambiguous → ${ambiguousQuery.assistant?.name || 'No assistant'}`); // null

// Example 4: Get assistant capabilities
console.log('\n=== ASSISTANT CAPABILITIES ===');

const assistants = AssistantRouter.getAvailableAssistants();
assistants.forEach(assistant => {
  console.log(`\n${assistant.avatar} ${assistant.name}:`);
  console.log(`Activation: ${assistant.activationPhrases.join(', ')}`);
  console.log(`Capabilities: ${assistant.capabilities.join(' | ')}`);
});

// Example 5: Route and get system prompt
function processUserMessage(userMessage: string) {
  const { assistant, systemPrompt } = routeToAssistant(userMessage);
  
  if (!assistant) {
    return "I'm not sure which assistant can help with that. Try 'Ask Tes' for retail questions or 'Ask Ces' for campaign questions.";
  }

  console.log(`\nRouted to: ${assistant.name}`);
  console.log(`System Prompt: ${systemPrompt?.substring(0, 100)}...`);
  
  // Here you would call your LLM with the system prompt
  return `${assistant.name} is ready to help with: ${userMessage}`;
}

// Test the routing system
const testMessages = [
  "Ask Tes for top performing brands in Visayas",
  "Ask Ces to analyze campaign effectiveness", 
  "Show me Alaska milk sales trends",
  "What's our social media sentiment this week?",
  "Help me with a creative brief for a client"
];

console.log('\n=== ROUTING TESTS ===');
testMessages.forEach(message => {
  const result = processUserMessage(message);
  console.log(`"${message}" → ${result}`);
});

export { routeToAssistant, AssistantRouter };