/**
 * Prompt Refining System
 * Eliminates redundancy and creates focused, tenant-specific assistant personalities
 */

export interface AssistantPersonality {
  name: string;
  role: string;
  expertise: string[];
  tone: string;
  vocabulary: string[];
  dataSource: string;
  forbiddenWords: string[];
  exampleQueries: string[];
  responseStyle: string;
}

export interface PromptTemplate {
  systemPrompt: string;
  contextPrompt: string;
  toolsPrompt: string;
  constraintsPrompt: string;
}

export class PromptRefiner {
  private basePrompt: string;
  private personality: AssistantPersonality;

  constructor(personality: AssistantPersonality) {
    this.personality = personality;
    this.basePrompt = this.buildBasePrompt();
  }

  private buildBasePrompt(): string {
    return `You are ${this.personality.name}, ${this.personality.role}.

EXPERTISE: ${this.personality.expertise.join(', ')}

COMMUNICATION STYLE:
- Tone: ${this.personality.tone}
- Use vocabulary: ${this.personality.vocabulary.join(', ')}
- NEVER use: ${this.personality.forbiddenWords.join(', ')}
- Response style: ${this.personality.responseStyle}

DATA SOURCE: ${this.personality.dataSource}`;
  }

  refineForContext(context: 'chat' | 'api' | 'dashboard'): PromptTemplate {
    switch (context) {
      case 'chat':
        return this.buildChatPrompt();
      case 'api':
        return this.buildAPIPrompt();
      case 'dashboard':
        return this.buildDashboardPrompt();
      default:
        throw new Error(`Unknown context: ${context}`);
    }
  }

  private buildChatPrompt(): PromptTemplate {
    return {
      systemPrompt: `${this.basePrompt}

CHAT INTERACTION RULES:
- Keep responses conversational but professional
- Ask clarifying questions when needed
- Provide actionable insights, not just data
- Reference specific metrics relevant to user's business
- End with suggested next steps or follow-up questions`,

      contextPrompt: `EXAMPLE INTERACTIONS:
${this.personality.exampleQueries.map(q => `User: "${q}"`).join('\n')}

Remember: You're having a business conversation, not just answering queries.`,

      toolsPrompt: this.buildToolsPrompt(),
      constraintsPrompt: this.buildConstraintsPrompt()
    };
  }

  private buildAPIPrompt(): PromptTemplate {
    return {
      systemPrompt: `${this.basePrompt}

API RESPONSE RULES:
- Return structured data only
- No conversational elements
- Include confidence scores
- Always validate SQL before execution
- Handle errors gracefully`,

      contextPrompt: `RESPONSE FORMAT:
{
  "data": [...],
  "confidence": 0.95,
  "query": "SELECT ...",
  "insights": ["key insight 1", "key insight 2"]
}`,

      toolsPrompt: this.buildToolsPrompt(),
      constraintsPrompt: this.buildConstraintsPrompt()
    };
  }

  private buildDashboardPrompt(): PromptTemplate {
    return {
      systemPrompt: `${this.basePrompt}

DASHBOARD INTERACTION RULES:
- Provide summary insights for visualization
- Suggest chart types for data
- Highlight anomalies and trends
- Keep explanations concise for UI display`,

      contextPrompt: `DASHBOARD CONTEXT:
- User is viewing data visually
- Provide context for charts and graphs
- Highlight what matters most
- Suggest drill-down options`,

      toolsPrompt: this.buildToolsPrompt(),
      constraintsPrompt: this.buildConstraintsPrompt()
    };
  }

  private buildToolsPrompt(): string {
    // This would be implemented based on tenant-specific tools
    return `AVAILABLE TOOLS: [Generated based on tenant]`;
  }

  private buildConstraintsPrompt(): string {
    return `CONSTRAINTS:
- Only access data for current tenant
- Respect user permissions
- Never expose sensitive information
- Validate all queries before execution
- Handle edge cases gracefully`;
  }

  generateFullPrompt(context: 'chat' | 'api' | 'dashboard'): string {
    const template = this.refineForContext(context);
    
    return [
      template.systemPrompt,
      template.contextPrompt,
      template.toolsPrompt,
      template.constraintsPrompt
    ].join('\n\n');
  }
}