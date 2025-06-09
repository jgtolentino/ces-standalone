/**
 * Tenant-Specific Schema Definitions for Azure Postgres
 * Maps each tenant's business domain to appropriate database schema
 */

export interface TenantSchema {
  tenant: string;
  database: string;
  tables: Record<string, TableSchema>;
  systemPrompt: string;
  tools: string[];
}

export interface TableSchema {
  name: string;
  primaryKey: string;
  columns: Record<string, ColumnSchema>;
  description: string;
}

export interface ColumnSchema {
  type: string;
  description: string;
  businessMeaning: string;
}

export const TENANT_SCHEMAS: Record<string, TenantSchema> = {
  'retail-insights': {
    tenant: 'retail-insights',
    database: 'retail_analytics_ph',
    tables: {
      sales_interactions: {
        name: 'sales_interactions',
        primaryKey: 'id',
        description: 'Core sales transaction data for Philippine retail market',
        columns: {
          id: { type: 'SERIAL', description: 'Primary key', businessMeaning: 'Unique transaction identifier' },
          store_name: { type: 'TEXT', description: 'Store location name', businessMeaning: 'Physical retail location where sale occurred' },
          region: { type: 'TEXT', description: 'Geographic region', businessMeaning: 'Philippine region (Luzon, Visayas, Mindanao)' },
          brand: { type: 'TEXT', description: 'Product brand', businessMeaning: 'Brand name (e.g. Alaska, Krem-Top, Oishi)' },
          sku: { type: 'TEXT', description: 'Stock keeping unit', businessMeaning: 'Specific product variant identifier' },
          category: { type: 'TEXT', description: 'Product category', businessMeaning: 'Product type (Snacks, Beverages, Dairy)' },
          sales: { type: 'NUMERIC', description: 'Sales amount in PHP', businessMeaning: 'Revenue in Philippine Pesos' },
          date: { type: 'DATE', description: 'Transaction date', businessMeaning: 'When the sale occurred' },
          channel: { type: 'TEXT', description: 'Sales channel', businessMeaning: 'How product was sold (In-store, Online, Marketplace)' }
        }
      },
      customer_demographics: {
        name: 'customer_demographics',
        primaryKey: 'customer_id',
        description: 'Customer profile and demographic information',
        columns: {
          customer_id: { type: 'SERIAL', description: 'Customer identifier', businessMeaning: 'Unique customer ID' },
          age_group: { type: 'TEXT', description: 'Age bracket', businessMeaning: 'Customer age range (18-25, 26-35, etc.)' },
          location: { type: 'TEXT', description: 'Customer location', businessMeaning: 'City or region of customer' },
          income_bracket: { type: 'TEXT', description: 'Income level', businessMeaning: 'Household income range' },
          shopping_frequency: { type: 'TEXT', description: 'Purchase frequency', businessMeaning: 'How often customer shops (Daily, Weekly, Monthly)' }
        }
      }
    },
    systemPrompt: `You are a Filipino Retail Analytics AI Assistant specializing in Philippine consumer goods data.

BUSINESS CONTEXT:
- You analyze sales data for brands like Alaska, Krem-Top, Oishi across Philippine regions
- Focus on regional performance (Luzon, Visayas, Mindanao)
- Understand Filipino shopping patterns and consumer behavior
- Sales amounts are in Philippine Pesos (PHP)

QUERY GUIDELINES:
- Always filter by relevant Filipino regions when asked about geography
- Consider seasonal patterns (e.g., summer drinks, Christmas shopping)
- Understand local brands vs international brands
- Include peso formatting for financial data

RESPONSE STYLE:
- Use Filipino business context (SM, Robinson's, 7-Eleven)
- Mention relevant seasonal/cultural events affecting sales
- Provide actionable insights for Philippine retail market`,
    tools: ['get_sales_by_region', 'get_brand_performance', 'get_customer_demographics', 'analyze_seasonal_trends']
  },

  'ces': {
    tenant: 'ces',
    database: 'campaign_effectiveness',
    tables: {
      campaigns: {
        name: 'campaigns',
        primaryKey: 'campaign_id',
        description: 'Marketing campaign tracking and performance data',
        columns: {
          campaign_id: { type: 'SERIAL', description: 'Campaign identifier', businessMeaning: 'Unique campaign ID' },
          campaign_name: { type: 'TEXT', description: 'Campaign title', businessMeaning: 'Human-readable campaign name' },
          brand: { type: 'TEXT', description: 'Brand being promoted', businessMeaning: 'Client brand (e.g., TBWA client brands)' },
          channel: { type: 'TEXT', description: 'Marketing channel', businessMeaning: 'Where campaign runs (Social, Display, TV, etc.)' },
          budget: { type: 'NUMERIC', description: 'Campaign budget in USD', businessMeaning: 'Total allocated budget' },
          spent: { type: 'NUMERIC', description: 'Amount spent', businessMeaning: 'Actual expenditure to date' },
          impressions: { type: 'BIGINT', description: 'Total impressions', businessMeaning: 'Number of times ad was displayed' },
          clicks: { type: 'INTEGER', description: 'Total clicks', businessMeaning: 'Number of user interactions' },
          conversions: { type: 'INTEGER', description: 'Total conversions', businessMeaning: 'Desired actions completed' },
          start_date: { type: 'DATE', description: 'Campaign start', businessMeaning: 'When campaign launched' },
          end_date: { type: 'DATE', description: 'Campaign end', businessMeaning: 'When campaign concludes' }
        }
      }
    },
    systemPrompt: `You are a Campaign Effectiveness System (CES) AI Assistant for TBWA advertising agency.

BUSINESS CONTEXT:
- You analyze marketing campaign performance for TBWA clients
- Focus on ROI, conversion rates, and optimization opportunities
- Understand advertising industry KPIs and benchmarks
- Work with multi-channel campaign data (Social, Display, TV, Print)

QUERY GUIDELINES:
- Calculate and highlight ROI, ROAS, CTR, conversion rates
- Compare performance across channels and time periods
- Identify optimization opportunities and budget allocation suggestions
- Consider campaign objectives (Awareness, Conversion, Engagement)

RESPONSE STYLE:
- Use advertising industry terminology
- Provide actionable optimization recommendations
- Include competitive benchmarking context
- Focus on performance improvement strategies`,
    tools: ['get_campaign_performance', 'calculate_roi_metrics', 'analyze_channel_effectiveness', 'generate_optimization_recommendations']
  },

  'scout': {
    tenant: 'scout',
    database: 'scout_analytics',
    tables: {
      brand_mentions: {
        name: 'brand_mentions',
        primaryKey: 'mention_id',
        description: 'Social media and web mentions of brands and campaigns',
        columns: {
          mention_id: { type: 'SERIAL', description: 'Mention identifier', businessMeaning: 'Unique mention tracking ID' },
          brand: { type: 'TEXT', description: 'Mentioned brand', businessMeaning: 'Brand being discussed' },
          platform: { type: 'TEXT', description: 'Social platform', businessMeaning: 'Where mention occurred (Twitter, Facebook, etc.)' },
          sentiment: { type: 'TEXT', description: 'Sentiment analysis', businessMeaning: 'Positive, Negative, or Neutral sentiment' },
          reach: { type: 'INTEGER', description: 'Potential reach', businessMeaning: 'Number of people who could see the mention' },
          engagement: { type: 'INTEGER', description: 'Engagement count', businessMeaning: 'Likes, shares, comments combined' },
          mention_date: { type: 'TIMESTAMP', description: 'When mentioned', businessMeaning: 'Date and time of mention' }
        }
      }
    },
    systemPrompt: `You are Scout, a Brand Intelligence AI Assistant for monitoring brand reputation and social media performance.

BUSINESS CONTEXT:
- You track brand mentions, sentiment, and social media performance
- Monitor competitive landscape and industry trends
- Analyze crisis situations and reputation management
- Understand social media platforms and engagement patterns

QUERY GUIDELINES:
- Analyze sentiment trends and reputation changes over time
- Compare brand performance against competitors
- Identify viral content and engagement opportunities
- Monitor for potential PR crises or negative sentiment spikes

RESPONSE STYLE:
- Provide real-time insights and alerts
- Use social media terminology and metrics
- Offer reputation management recommendations
- Include trending topics and viral content analysis`,
    tools: ['get_brand_sentiment', 'analyze_social_trends', 'monitor_competitor_mentions', 'detect_crisis_indicators']
  },

  'tbwa-chat': {
    tenant: 'tbwa-chat',
    database: 'tbwa_knowledge',
    tables: {
      client_knowledge: {
        name: 'client_knowledge',
        primaryKey: 'knowledge_id',
        description: 'TBWA client information and project knowledge base',
        columns: {
          knowledge_id: { type: 'SERIAL', description: 'Knowledge entry ID', businessMeaning: 'Unique knowledge base identifier' },
          client_name: { type: 'TEXT', description: 'Client company', businessMeaning: 'TBWA client company name' },
          project_name: { type: 'TEXT', description: 'Project title', businessMeaning: 'Specific client project or campaign' },
          category: { type: 'TEXT', description: 'Knowledge category', businessMeaning: 'Type of information (Strategy, Creative, Analytics)' },
          content: { type: 'TEXT', description: 'Knowledge content', businessMeaning: 'Detailed information or insights' },
          tags: { type: 'TEXT[]', description: 'Content tags', businessMeaning: 'Searchable keywords and categories' },
          created_date: { type: 'TIMESTAMP', description: 'Creation date', businessMeaning: 'When knowledge was added' }
        }
      }
    },
    systemPrompt: `You are the TBWA Chat Assistant, an internal AI helper for TBWA agency staff and clients.

BUSINESS CONTEXT:
- You assist TBWA employees with client information and project details
- Access internal knowledge base and project documentation
- Help with creative briefs, strategy documents, and campaign insights
- Understand TBWA's creative philosophy and client relationships

QUERY GUIDELINES:
- Provide relevant client information and project context
- Suggest creative strategies and campaign approaches
- Access historical campaign performance and learnings
- Maintain confidentiality and professionalism

RESPONSE STYLE:
- Professional and agency-appropriate tone
- Reference TBWA methodologies and frameworks
- Provide actionable insights for creative and strategic work
- Include relevant case studies and best practices`,
    tools: ['search_client_knowledge', 'get_project_details', 'find_creative_references', 'access_campaign_learnings']
  }
};

export function getTenantSchema(tenantId: string): TenantSchema | null {
  return TENANT_SCHEMAS[tenantId] || null;
}

export function generateSchemaPrompt(tenantId: string): string {
  const schema = getTenantSchema(tenantId);
  if (!schema) return '';

  let prompt = `${schema.systemPrompt}\n\nDATABASE SCHEMA:\n`;
  
  Object.values(schema.tables).forEach(table => {
    prompt += `\nTable: ${table.name}\n`;
    prompt += `Description: ${table.description}\n`;
    prompt += `Columns:\n`;
    
    Object.entries(table.columns).forEach(([colName, colDef]) => {
      prompt += `- ${colName} (${colDef.type}): ${colDef.businessMeaning}\n`;
    });
  });

  return prompt;
}