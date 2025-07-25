# Scout Analytics Edge Function Architecture

## Overview
21 production-ready edge functions deployed under `tbwa-databank` powering the complete Scout Analytics platform.

## Function Categories

### 🤖 Core AI Functions

| Function | Purpose | Input | Output | Used By |
|----------|---------|-------|--------|---------|
| `retailbot` | NLP assistant for retail analytics | `{ prompt: string, context?: object }` | `{ results: object[], insights: string[] }` | RetailBot module |
| `adsbot` | Campaign performance & SKU attribution | `{ campaign_id?: string, date_range?: object }` | `{ performance: object, attribution: object[] }` | Brand Comparison module |
| `ai-categorize` | Category/sentiment classification | `{ text: string, type: 'category' \| 'sentiment' }` | `{ category: string, confidence: number }` | Product Mix module |
| `ocr-parser` | Receipt OCR extraction | `{ image_url: string \| base64: string }` | `{ items: object[], total: number }` | Databank module |
| `parse-files` | Document analysis & CSV handling | `{ file_url: string, type: string }` | `{ data: object[], metadata: object }` | Data Import pipeline |
| `suki-bot` | Market simulation for sari-sari | `{ scenario: object, parameters: object }` | `{ simulation: object, predictions: object[] }` | Market Analysis |

### 🌍 Geospatial & Demographic Functions

| Function | Purpose | Input | Output | Used By |
|----------|---------|-------|--------|---------|
| `municipalities-geojson` | Choropleth-ready GeoJSON | `{ region?: string, metric?: string }` | GeoJSON FeatureCollection | Geographic Analysis |
| `sari-sari-expert` | Barangay-level retail insights | `{ barangay_id?: string, query: string }` | `{ insights: object, recommendations: string[] }` | Location Intelligence |
| `enhanced-sari-sari-expert` | Overlay demographic + SKU data | `{ location: object, demographics: boolean }` | `{ enriched_data: object, overlays: object[] }` | Consumer Profiling |
| `get_scout_demographics` | SQL function for charts | `{ date_from?: date, date_to?: date }` | `{ demographics: object[] }` | Consumer Profiling |

### 🧪 Utility & Experimental Functions

| Function | Purpose | Status | Notes |
|----------|---------|--------|-------|
| `sql-certifier` | SQL validation before execution | Production | Prevents SQL injection |
| `aladdin` | Agent runtime transformer | Experimental | For Pulser agent orchestration |
| `make-server-*` | Generic SSR handlers | Production | Claude/Groq agent hosting |
| `geojson` | GeoJSON formatter | Production | Data transformation |
| `jsonify` | JSON transformation pipeline | Production | API response formatting |

## Agent-Function-Module Mapping

```yaml
scout_analytics_mapping:
  agents:
    retailbot:
      name: "RetailBot"
      description: "AI-powered analytics assistant"
      functions:
        - retailbot
        - ai-categorize
      modules:
        - retailbot_interface
        - natural_language_queries
    
    basher:
      name: "Basher"
      description: "Geospatial analytics agent"
      functions:
        - municipalities-geojson
        - sari-sari-expert
        - enhanced-sari-sari-expert
      modules:
        - geographic_analysis
        - location_intelligence
    
    dash:
      name: "Dash"
      description: "Data processing agent"
      functions:
        - parse-files
        - ocr-parser
        - jsonify
      modules:
        - databank
        - data_import
    
    scout_core:
      name: "Scout Core"
      description: "Core analytics engine"
      functions:
        - get_scout_demographics
        - sql-certifier
      modules:
        - overview
        - consumer_profiling
        - transaction_trends

  modules:
    retailbot_interface:
      route: "/retailbot"
      functions: ["retailbot", "ai-categorize"]
      capabilities:
        - natural_language_queries
        - contextual_insights
        - predictive_analytics
    
    geographic_analysis:
      route: "/geographic-analysis"
      functions: ["municipalities-geojson", "enhanced-sari-sari-expert"]
      capabilities:
        - choropleth_maps
        - population_overlay
        - regional_insights
    
    consumer_profiling:
      route: "/consumer-profiling"
      functions: ["get_scout_demographics", "enhanced-sari-sari-expert"]
      capabilities:
        - demographic_charts
        - behavior_patterns
        - segment_analysis
    
    databank:
      route: "/databank"
      functions: ["parse-files", "ocr-parser", "sql-certifier"]
      capabilities:
        - data_import
        - validation
        - transformation
```

## Function Endpoints

All edge functions are accessible via:
```
https://[project-ref].supabase.co/functions/v1/[function-name]
```

### Authentication
```javascript
const response = await fetch('https://[project-ref].supabase.co/functions/v1/retailbot', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ prompt: 'Show me top performing regions' })
});
```

## Scaling & Monitoring

### Critical Functions (Auto-scale enabled)
- `retailbot` - 100 req/min rate limit
- `parse-files` - 50 req/min rate limit
- `adsbot` - 75 req/min rate limit
- `municipalities-geojson` - Cached for 1 hour

### Monitoring
- Enable Supabase logs for all production functions
- Set up alerts for:
  - Function failures > 5% error rate
  - Response time > 3 seconds
  - Rate limit exceeded

### Error Handling
All functions should return standardized error responses:
```json
{
  "error": {
    "code": "FUNCTION_ERROR",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Development Guidelines

1. **Function Naming**: Use kebab-case (e.g., `sari-sari-expert`)
2. **Versioning**: Include version in response headers
3. **Documentation**: Each function must have OpenAPI spec
4. **Testing**: Minimum 80% code coverage
5. **Security**: All inputs validated, SQL injection protected

## Deployment Pipeline

```bash
# Deploy single function
supabase functions deploy retailbot

# Deploy all functions
supabase functions deploy --all

# Test locally
supabase functions serve retailbot --env-file .env.local
```

## Future Roadmap

- [ ] GraphQL wrapper for all functions
- [ ] WebSocket support for real-time analytics
- [ ] Function composition API
- [ ] Multi-region deployment
- [ ] Advanced caching strategies

---

*Last updated: January 2025*
*Architecture version: 2.0*