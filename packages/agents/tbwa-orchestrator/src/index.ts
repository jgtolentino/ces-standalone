import { CESIntegration } from './integrations/ces';
import { ScoutIntegration } from './integrations/scout';
import { ReasoningEngine } from './reasoning';
import { IntentClassifier } from './classifier';
import { ResponseSynthesizer } from './synthesizer';

export interface ChatRequest {
  message: string;
  sessionId: string;
  context?: {
    previousMessages?: any[];
    tenantId?: string;
  };
  includeReasoning?: boolean;
}

export interface ChatResponse {
  message: string;
  sources: string[];
  reasoning: ReasoningStep[];
  visualizationData?: any;
  confidence: number;
}

export interface ReasoningStep {
  agent: string;
  action: string;
  reasoning: string;
  confidence: number;
  sources: string[];
  duration: number;
  timestamp: Date;
}

export class TBWAOrchestrator {
  private cesIntegration: CESIntegration;
  private scoutIntegration: ScoutIntegration;
  private reasoningEngine: ReasoningEngine;
  private intentClassifier: IntentClassifier;
  private responseSynthesizer: ResponseSynthesizer;

  constructor() {
    this.cesIntegration = new CESIntegration();
    this.scoutIntegration = new ScoutIntegration();
    this.reasoningEngine = new ReasoningEngine();
    this.intentClassifier = new IntentClassifier();
    this.responseSynthesizer = new ResponseSynthesizer();
  }

  async process(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    const reasoning: ReasoningStep[] = [];

    try {
      // Step 1: Classify intent
      const intent = await this.classifyIntent(request.message, reasoning);
      
      // Step 2: Route to appropriate data sources
      const dataResults = await this.routeDataRetrieval(intent, request, reasoning);
      
      // Step 3: Synthesize response
      const response = await this.synthesizeResponse(
        request, 
        dataResults, 
        reasoning
      );

      // Step 4: Generate visualization if applicable
      const visualizationData = await this.generateVisualization(
        dataResults, 
        intent, 
        reasoning
      );

      return {
        message: response.message,
        sources: response.sources,
        reasoning: request.includeReasoning ? reasoning : [],
        visualizationData,
        confidence: response.confidence
      };

    } catch (error) {
      reasoning.push({
        agent: 'orchestrator',
        action: 'error_handling',
        reasoning: `Error occurred during processing: ${error.message}`,
        confidence: 0,
        sources: [],
        duration: Date.now() - startTime,
        timestamp: new Date()
      });

      return {
        message: 'I apologize, but I encountered an error processing your request. Please try rephrasing your question.',
        sources: [],
        reasoning: request.includeReasoning ? reasoning : [],
        confidence: 0
      };
    }
  }

  private async classifyIntent(
    message: string, 
    reasoning: ReasoningStep[]
  ): Promise<string> {
    const startTime = Date.now();
    
    const intent = await this.intentClassifier.classify(message);
    
    reasoning.push({
      agent: 'intent_classifier',
      action: 'classify_intent',
      reasoning: `Classified user intent as "${intent}" based on keywords and patterns in the message`,
      confidence: intent.confidence,
      sources: [],
      duration: Date.now() - startTime,
      timestamp: new Date()
    });

    return intent.type;
  }

  private async routeDataRetrieval(
    intent: string,
    request: ChatRequest,
    reasoning: ReasoningStep[]
  ): Promise<any[]> {
    const startTime = Date.now();
    const results = [];

    switch (intent) {
      case 'campaign_analysis':
        const cesData = await this.cesIntegration.getCampaignMetrics(request);
        results.push({ source: 'ces', data: cesData });
        
        reasoning.push({
          agent: 'ces_integration',
          action: 'fetch_campaign_data',
          reasoning: 'Retrieved campaign effectiveness metrics from CES database',
          confidence: cesData.confidence || 0.9,
          sources: cesData.sources || [],
          duration: Date.now() - startTime,
          timestamp: new Date()
        });
        break;

      case 'retail_insights':
        const scoutData = await this.scoutIntegration.getRetailInsights(request);
        results.push({ source: 'scout', data: scoutData });
        
        reasoning.push({
          agent: 'scout_integration',
          action: 'fetch_retail_data',
          reasoning: 'Analyzed retail performance data from Scout platform',
          confidence: scoutData.confidence || 0.9,
          sources: scoutData.sources || [],
          duration: Date.now() - startTime,
          timestamp: new Date()
        });
        break;

      case 'cross_platform':
        // Fetch from both sources
        const [cesResult, scoutResult] = await Promise.all([
          this.cesIntegration.getCampaignMetrics(request),
          this.scoutIntegration.getRetailInsights(request)
        ]);
        
        results.push(
          { source: 'ces', data: cesResult },
          { source: 'scout', data: scoutResult }
        );
        
        reasoning.push({
          agent: 'multi_source_integration',
          action: 'fetch_cross_platform_data',
          reasoning: 'Retrieved data from both CES and Scout to provide comprehensive insights',
          confidence: Math.min(cesResult.confidence || 0.9, scoutResult.confidence || 0.9),
          sources: [...(cesResult.sources || []), ...(scoutResult.sources || [])],
          duration: Date.now() - startTime,
          timestamp: new Date()
        });
        break;

      default:
        reasoning.push({
          agent: 'orchestrator',
          action: 'general_response',
          reasoning: 'No specific data retrieval needed for general query',
          confidence: 0.8,
          sources: [],
          duration: Date.now() - startTime,
          timestamp: new Date()
        });
    }

    return results;
  }

  private async synthesizeResponse(
    request: ChatRequest,
    dataResults: any[],
    reasoning: ReasoningStep[]
  ): Promise<{ message: string; sources: string[]; confidence: number }> {
    const startTime = Date.now();
    
    const response = await this.responseSynthesizer.synthesize({
      query: request.message,
      data: dataResults,
      context: request.context
    });

    reasoning.push({
      agent: 'response_synthesizer',
      action: 'synthesize_response',
      reasoning: 'Synthesized natural language response from retrieved data',
      confidence: response.confidence,
      sources: response.sources,
      duration: Date.now() - startTime,
      timestamp: new Date()
    });

    return response;
  }

  private async generateVisualization(
    dataResults: any[],
    intent: string,
    reasoning: ReasoningStep[]
  ): Promise<any> {
    const startTime = Date.now();

    if (dataResults.length === 0) return null;

    // Determine if visualization is appropriate
    const hasNumericData = dataResults.some(result => 
      result.data?.metrics || result.data?.trends
    );

    if (!hasNumericData) return null;

    const visualizationConfig = {
      type: this.getVisualizationType(intent, dataResults),
      data: this.extractVisualizationData(dataResults),
      layout: {
        title: this.generateVisualizationTitle(intent),
        theme: 'tbwa'
      }
    };

    reasoning.push({
      agent: 'visualization_generator',
      action: 'generate_visualization',
      reasoning: `Generated ${visualizationConfig.type} visualization for data representation`,
      confidence: 0.8,
      sources: [],
      duration: Date.now() - startTime,
      timestamp: new Date()
    });

    return visualizationConfig;
  }

  private getVisualizationType(intent: string, dataResults: any[]): string {
    // Logic to determine appropriate visualization type
    if (intent === 'campaign_analysis') return 'line-chart';
    if (intent === 'retail_insights') return 'bar-chart';
    return 'table';
  }

  private extractVisualizationData(dataResults: any[]): any {
    return dataResults.map(result => result.data);
  }

  private generateVisualizationTitle(intent: string): string {
    const titles = {
      'campaign_analysis': 'Campaign Performance Metrics',
      'retail_insights': 'Retail Performance Insights',
      'cross_platform': 'Cross-Platform Analytics'
    };
    return titles[intent] || 'Data Insights';
  }
}