// Context utility for CES and Scout analytics
// Provides contextual information for AI queries

interface CESContextParams {
  brand?: string;
  region?: string;
  dateRange?: string;
  campaignId?: string;
}

interface ScoutContextParams {
  brand?: string;
  region?: string;
  category?: string;
  timeframe?: string;
}

/**
 * Get contextual information for CES (Creative Effectiveness System) queries
 */
export async function getCESContext(params: CESContextParams): Promise<string> {
  const { brand, region, dateRange, campaignId } = params;
  
  let context = "TBWA Creative Effectiveness System (CES) Context:\n";
  
  // Brand-specific context
  if (brand) {
    const brandContext = getBrandContext(brand);
    context += `\nBrand: ${brand}\n${brandContext}`;
  }
  
  // Regional context
  if (region) {
    const regionalContext = getRegionalContext(region);
    context += `\nRegion: ${region}\n${regionalContext}`;
  }
  
  // Date range context
  if (dateRange) {
    context += `\nTime Period: ${dateRange}`;
  }
  
  // Campaign-specific context
  if (campaignId) {
    const campaignContext = await getCampaignContext(campaignId);
    context += `\nCampaign Context: ${campaignContext}`;
  }
  
  // Add CES framework context
  context += `
  
CES Framework Guidelines:
- Memorability: How well the creative sticks in consumers' minds
- Brand Connection: Clear linkage between creative and brand identity
- Emotional Resonance: Emotional impact and connection with audience
- Clear Communication: Message clarity and comprehension
- Call-to-Action Strength: Effectiveness of desired action prompting

Key Performance Indicators:
- Brand Recall: Unaided and aided brand recognition
- Purchase Intent: Likelihood to buy after exposure
- Message Comprehension: Understanding of key messages
- Emotional Response: Positive sentiment and engagement
- Action Completion: CTA click-through and conversion rates`;

  return context;
}

/**
 * Get contextual information for Scout Analytics queries
 */
export async function getScoutContext(params: ScoutContextParams): Promise<string> {
  const { brand, region, category, timeframe } = params;
  
  let context = "Scout Analytics - Philippine Retail Intelligence Context:\n";
  
  if (brand) {
    const brandContext = getBrandContext(brand);
    context += `\nBrand: ${brand}\n${brandContext}`;
  }
  
  if (region) {
    const regionalContext = getRegionalContext(region);
    context += `\nRegion: ${region}\n${regionalContext}`;
  }
  
  if (category) {
    context += `\nProduct Category: ${category}`;
  }
  
  if (timeframe) {
    context += `\nAnalysis Timeframe: ${timeframe}`;
  }
  
  context += `
  
Scout Analytics Capabilities:
- Real-time transaction analysis (5,000+ daily transactions)
- Consumer behavior insights across 17 Philippine regions
- Competitive intelligence and market share tracking
- Product mix optimization and inventory forecasting
- Regional performance and channel analytics

Key Metrics Available:
- Transaction volumes and values
- Market share by brand and category
- Consumer demographics and preferences
- Seasonal patterns and trends
- Competitive positioning`;

  return context;
}

/**
 * Get brand-specific context information
 */
function getBrandContext(brand: string): string {
  const brandData: Record<string, string> = {
    'Alaska': `
- Category: Milk & Dairy Products
- Market Position: Premium dairy brand
- Key Products: Fresh milk, powdered milk, condensada
- Target Demographic: Families with children, health-conscious consumers
- Brand Values: Nutrition, family care, quality`,
    
    'Oishi': `
- Category: Snacks & Confectionery  
- Market Position: Fun, innovative snack brand
- Key Products: Prawn crackers, biscuits, candies
- Target Demographic: Kids, teens, young adults
- Brand Values: Fun, innovation, taste`,
    
    'Del Monte': `
- Category: Processed Foods & Beverages
- Market Position: Trusted food brand
- Key Products: Canned goods, juices, pasta sauce
- Target Demographic: Busy families, working professionals
- Brand Values: Quality, convenience, nutrition`,
    
    'Peerless': `
- Category: Beverages
- Market Position: Local beverage leader
- Key Products: Soft drinks, juices
- Target Demographic: Mass market, value-conscious consumers
- Brand Values: Local pride, affordability, refreshment`,
    
    'JTI': `
- Category: Tobacco Products
- Market Position: International tobacco company
- Key Products: Cigarettes, tobacco products
- Target Demographic: Adult smokers
- Brand Values: Quality, heritage, responsibility`
  };
  
  return brandData[brand] || `- Category: Consumer Goods\n- Market Position: Established brand`;
}

/**
 * Get region-specific context information
 */
function getRegionalContext(region: string): string {
  const regionData: Record<string, string> = {
    'NCR': `
- National Capital Region (Metro Manila)
- Population: 13+ million
- Characteristics: Urban, high income, diverse demographics
- Retail Landscape: Modern trade dominant, e-commerce growth
- Consumer Behavior: Brand conscious, convenience-focused`,
    
    'Region 3': `
- Central Luzon
- Population: 12+ million  
- Characteristics: Mix of urban and rural, agricultural
- Retail Landscape: Traditional and modern trade
- Consumer Behavior: Value-conscious, family-oriented`,
    
    'Region 4A': `
- CALABARZON (Cavite, Laguna, Batangas, Rizal, Quezon)
- Population: 14+ million
- Characteristics: Suburban, growing middle class
- Retail Landscape: Expanding modern trade
- Consumer Behavior: Aspirational, brand-aware`,
    
    'Visayas': `
- Central Philippines (Cebu, Bohol, Negros, etc.)
- Population: 20+ million
- Characteristics: Island provinces, diverse economies
- Retail Landscape: Mix of traditional and modern
- Consumer Behavior: Regional preferences, price-sensitive`,
    
    'Mindanao': `
- Southern Philippines
- Population: 25+ million
- Characteristics: Agricultural, diverse cultures
- Retail Landscape: Traditional trade strong
- Consumer Behavior: Local preferences, value-focused`
  };
  
  return regionData[region] || `- Regional market characteristics vary
- Mix of urban and rural demographics
- Diverse retail landscape`;
}

/**
 * Get campaign-specific context (placeholder for database integration)
 */
async function getCampaignContext(campaignId: string): Promise<string> {
  // In a real implementation, this would query the database
  // For now, return a generic context
  return `Campaign ID: ${campaignId}
- Active creative campaign
- Performance data available
- CES analysis applicable`;
}

/**
 * Extract context filters from request
 */
export function extractContextFilters(body: any) {
  return {
    brand: body.brand || body.filters?.brand,
    region: body.region || body.filters?.region,
    dateRange: body.dateRange || body.filters?.dateRange,
    category: body.category || body.filters?.category,
    timeframe: body.timeframe || body.filters?.timeframe,
    campaignId: body.campaignId || body.filters?.campaignId
  };
}

/**
 * Validate context parameters
 */
export function validateContext(params: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate brand if provided
  if (params.brand && !['Alaska', 'Oishi', 'Del Monte', 'Peerless', 'JTI'].includes(params.brand)) {
    errors.push(`Unknown brand: ${params.brand}`);
  }
  
  // Validate region if provided
  if (params.region && !['NCR', 'Region 3', 'Region 4A', 'Visayas', 'Mindanao'].includes(params.region)) {
    errors.push(`Unknown region: ${params.region}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}