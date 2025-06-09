/**
 * Prompt Factory - Dynamic System Prompt Generation
 * Eliminates redundancy and creates focused prompts per context
 */

import { CESPromptRefiner } from './ces-personality';
import { RetailPromptRefiner } from './retail-personality';

export type TenantId = 'ces' | 'retail-insights' | 'scout' | 'tbwa-chat';
export type PromptContext = 'chat' | 'api' | 'dashboard';

export class PromptFactory {
  private static refiners = new Map<TenantId, any>();

  static {
    this.refiners.set('ces', new CESPromptRefiner());
    this.refiners.set('retail-insights', new RetailPromptRefiner());
    // Add other tenant refiners as needed
  }

  /**
   * Generate optimized system prompt for specific tenant and context
   */
  static generatePrompt(
    tenantId: TenantId, 
    context: PromptContext,
    options?: {
      region?: string;
      userRole?: string;
      customConstraints?: string[];
    }
  ): string {
    const refiner = this.refiners.get(tenantId);
    
    if (!refiner) {
      throw new Error(`No prompt refiner found for tenant: ${tenantId}`);
    }

    let prompt = refiner.generateFullPrompt(context);

    // Apply contextual modifications
    if (options?.region && tenantId === 'retail-insights') {
      prompt = (refiner as RetailPromptRefiner).generateLocalizedPrompt(options.region);
    }

    if (options?.userRole) {
      prompt += `\n\nUSER ROLE: ${options.userRole}`;
    }

    if (options?.customConstraints?.length) {
      prompt += `\n\nADDITIONAL CONSTRAINTS:\n${options.customConstraints.map(c => `- ${c}`).join('\n')}`;
    }

    return this.optimizePrompt(prompt);
  }

  /**
   * Remove redundancy and optimize prompt length
   */
  private static optimizePrompt(prompt: string): string {
    // Remove duplicate lines
    const lines = prompt.split('\n');
    const uniqueLines = [...new Set(lines)];
    
    // Remove empty lines at start/end
    const trimmed = uniqueLines
      .filter((line, index, arr) => {
        // Keep non-empty lines
        if (line.trim()) return true;
        
        // Keep empty lines that separate sections
        const prevLine = arr[index - 1];
        const nextLine = arr[index + 1];
        return prevLine?.trim() && nextLine?.trim();
      });

    return trimmed.join('\n');
  }

  /**
   * Get schema-specific prompt for SQL generation
   */
  static getSchemaPrompt(tenantId: TenantId): string {
    const refiner = this.refiners.get(tenantId);
    
    if (!refiner) {
      throw new Error(`No schema prompt found for tenant: ${tenantId}`);
    }

    // Extract just the schema and SQL guidelines from tools prompt
    const fullPrompt = refiner.generateFullPrompt('api');
    const toolsSection = fullPrompt.split('AVAILABLE')[1]?.split('CONSTRAINTS:')[0];
    
    return toolsSection || '';
  }

  /**
   * A/B test different prompt variations
   */
  static generateVariation(
    tenantId: TenantId,
    context: PromptContext,
    variation: 'concise' | 'detailed' | 'conversational'
  ): string {
    const basePrompt = this.generatePrompt(tenantId, context);

    switch (variation) {
      case 'concise':
        return this.makeConcise(basePrompt);
      case 'detailed':
        return this.makeDetailed(basePrompt);
      case 'conversational':
        return this.makeConversational(basePrompt);
      default:
        return basePrompt;
    }
  }

  private static makeConcise(prompt: string): string {
    return prompt
      .replace(/EXAMPLE.*?\n\n/gs, '') // Remove examples
      .replace(/\n\n+/g, '\n\n') // Reduce spacing
      .replace(/- [^-]*detailed[^-]*\n/gi, ''); // Remove detailed guidelines
  }

  private static makeDetailed(prompt: string): string {
    return prompt + `\n\nDETAILED GUIDELINES:
- Always explain your reasoning
- Provide context for recommendations
- Include confidence levels in responses
- Suggest follow-up questions or actions
- Reference industry benchmarks when available`;
  }

  private static makeConversational(prompt: string): string {
    return prompt.replace(
      /Response style: [^\n]*/g,
      'Response style: Conversational and friendly while maintaining professionalism. Use "I" statements and ask engaging questions.'
    );
  }

  /**
   * Generate prompt for multi-tenant scenarios
   */
  static generateCrossTenanxtsPrompt(
    primaryTenant: TenantId,
    secondaryTenants: TenantId[],
    context: PromptContext
  ): string {
    const primaryPrompt = this.generatePrompt(primaryTenant, context);
    
    const secondaryContext = secondaryTenants
      .map(tenant => `- ${tenant}: Limited access for comparative analysis only`)
      .join('\n');

    return `${primaryPrompt}\n\nCROSS-TENANT ACCESS:\n${secondaryContext}\n\nAlways prioritize ${primaryTenant} data and perspective.`;
  }
}

// Utility function for easy access
export function getSystemPrompt(
  tenantId: TenantId, 
  context: PromptContext = 'chat',
  options?: Parameters<typeof PromptFactory.generatePrompt>[2]
): string {
  return PromptFactory.generatePrompt(tenantId, context, options);
}