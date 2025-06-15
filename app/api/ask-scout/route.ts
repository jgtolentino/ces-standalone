/**
 * Ask Scout API Route
 * Cherry-picked from CES Q&A architecture for scalable AI interactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { roleEngine, type PromptContext } from '../../../lib/prompting/role-engine';

interface AskScoutRequest {
  query: string;
  role_id?: string;
  widget_context?: string;
  data_context?: Record<string, any>;
  response_type?: 'insight' | 'question' | 'alert';
}

interface AskScoutResponse {
  response: string;
  metadata: {
    generated_by: string;
    timestamp: string;
    source: string;
    confidence: number;
    role_context: string;
    data_sources: string[];
    processing_time_ms: number;
  };
  suggestions?: string[];
  related_widgets?: string[];
}

// Rate limiting (simple in-memory store for MVP)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (clientData.count >= RATE_LIMIT) {
    return false;
  }
  
  clientData.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    const body: AskScoutRequest = await request.json();
    const { 
      query, 
      role_id = 'brand_manager', 
      widget_context, 
      data_context,
      response_type = 'question'
    } = body;

    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get role context
    const role = roleEngine.getRole(role_id);
    if (!role) {
      return NextResponse.json(
        { error: `Invalid role: ${role_id}` },
        { status: 400 }
      );
    }

    // Generate contextual prompt
    const promptContext: PromptContext = {
      role,
      widget_context,
      data_context,
      confidence_threshold: 0.75
    };

    const contextualPrompt = roleEngine.generateContextualPrompt(
      query,
      promptContext,
      response_type
    );

    // Simulate AI response (replace with actual OpenAI/Azure call)
    const aiResponse = await generateAIResponse(contextualPrompt, query, role);

    // Generate metadata
    const metadata = roleEngine.generateInsightMetadata(
      'ask-scout-api',
      aiResponse.confidence,
      role,
      ['transactions', 'products', 'customers']
    );

    // Validate response quality
    const validation = roleEngine.validateInsightQuality(
      aiResponse.response,
      metadata,
      role
    );

    const processingTime = Date.now() - startTime;

    const response: AskScoutResponse = {
      response: aiResponse.response,
      metadata: {
        ...metadata,
        processing_time_ms: processingTime
      },
      suggestions: generateSuggestions(query, role),
      related_widgets: roleEngine.getRelevantWidgets(role_id)
    };

    // Add quality feedback to response
    if (!validation.valid) {
      response.metadata.confidence = Math.max(0.1, response.metadata.confidence - 0.2);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Ask Scout API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// Simulate AI response generation (replace with actual AI service)
async function generateAIResponse(
  prompt: string, 
  query: string, 
  role: any
): Promise<{ response: string; confidence: number }> {
  
  // Mock responses based on query patterns
  const mockResponses = {
    'revenue': {
      response: `Based on current data, total revenue is ₱3.84M with +8.2% growth. Key drivers include strong performance in beverages (32.4% share) and improved basket sizes in premium segments. I recommend focusing on regional expansion in Visayas where we see 15% untapped potential.`,
      confidence: 0.87
    },
    'basket': {
      response: `Basket size analysis shows ₱245 average with declining trend (-1.2%). Premium customers maintain higher baskets (₱380) while value-seekers average ₱165. Consider targeted promotions for mid-tier segments to drive basket growth.`,
      confidence: 0.82
    },
    'regional': {
      response: `Regional performance varies significantly: NCR leads with ₱1.2M revenue, while Mindanao shows highest growth (+18%). Store efficiency in Region 4A needs attention with 23% below-target performance. Opportunity for targeted interventions.`,
      confidence: 0.79
    },
    'default': {
      response: `I understand you're asking about "${query}". Based on your role as ${role.display_name}, here's what the data shows: Current metrics indicate positive trends with opportunities for optimization. I recommend reviewing the relevant dashboard widgets for detailed insights.`,
      confidence: 0.65
    }
  };

  const queryLower = query.toLowerCase();
  let selectedResponse = mockResponses.default;

  for (const [key, response] of Object.entries(mockResponses)) {
    if (key !== 'default' && queryLower.includes(key)) {
      selectedResponse = response;
      break;
    }
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));

  return selectedResponse;
}

function generateSuggestions(query: string, role: any): string[] {
  const baseSuggestions = [
    'Show me regional performance breakdown',
    'What are the top performing products?',
    'How do customer segments compare?',
    'Analyze seasonal trends'
  ];

  // Role-specific suggestions
  const roleSuggestions = {
    'brand_manager': [
      'Compare our market share vs competitors',
      'Show campaign ROI for last quarter',
      'Alert me to significant brand share changes'
    ],
    'category_manager': [
      'Analyze product substitution patterns',
      'Show pricing optimization opportunities',
      'Review category health metrics'
    ],
    'regional_director': [
      'Show underperforming store locations',
      'Compare regional growth rates',
      'Identify expansion opportunities'
    ]
  };

  const roleSpecific = roleSuggestions[role.id as keyof typeof roleSuggestions] || [];
  
  return [...roleSpecific.slice(0, 2), ...baseSuggestions.slice(0, 2)];
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Ask Scout API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      'POST /api/ask-scout': 'Submit questions and get AI-powered insights',
      'GET /api/ask-scout': 'Service information'
    },
    rate_limits: {
      requests_per_hour: RATE_LIMIT,
      window_minutes: 60
    },
    supported_roles: ['brand_manager', 'category_manager', 'regional_director'],
    response_types: ['question', 'insight', 'alert']
  });
}