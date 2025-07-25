# Scout Dashboard v3.1.0 - Market Share Analytics

## 🎯 Realistic Market Share Model

Scout Dashboard v3.1.0 now features an **authentic Philippine retail market model** that reflects real-world dynamics:

### Market Share Distribution
```
┌─────────────────────────────────────────────┐
│ JTI (Tobacco)          │ 40% │ ████████████ │
│ TBWA Clients (Non-JTI) │ 20% │ ██████       │  
│ Competitors            │ 40% │ ████████████ │
└─────────────────────────────────────────────┘
```

## 📊 Why This Model?

### 1. **JTI Dominance (40%)**
- Reflects tobacco's significant market presence in Philippine retail
- Premium pricing and high purchase frequency
- Strong brand loyalty (Winston, Camel, Mevius)
- Evening sales patterns (5PM-9PM peak)

### 2. **TBWA Portfolio (20%)**
- Balanced across multiple categories:
  - **Liwayway**: Snacks and beverages (Oishi, Smart C+)
  - **Del Monte**: Food products and sauces
  - **Snow**: Dairy products
  - **P&G**: Home care (Downy, Tide, Safeguard)
- Demonstrates TBWA's diverse client base beyond tobacco

### 3. **Competitive Landscape (40%)**
- Major players: Philip Morris, Unilever, Nestle, San Miguel
- Creates realistic competitive pressure
- Enables meaningful benchmarking and insights

## 🚀 Enhanced Analytics Features

### Market Share Performance Dashboard
```sql
-- Real-time market share tracking
SELECT * FROM scout_market_share_performance
WHERE month >= CURRENT_DATE - INTERVAL '30 days';
```

**Key Metrics:**
- Transaction share vs target
- Revenue share vs target
- Estimated handshake scores by segment
- 360-day rolling trends

### JTI Performance Suite
```sql
-- JTI brand dominance analysis
SELECT * FROM scout_jti_analysis
ORDER BY brand_revenue DESC;
```

**Insights Provided:**
- Brand-level performance (Winston, Camel, etc.)
- Evening sales concentration
- Weekly store penetration
- Handshake score optimization (0.70-0.85 range)

### Competitive Intelligence
```sql
-- Head-to-head market comparison
SELECT * FROM scout_competitive_dashboard;
```

**Competitive Metrics:**
- Market share actuals vs targets
- Performance alerts (under/over-performing)
- Revenue distribution analysis
- Strategic recommendations

## 📈 360-Day Rolling Analytics

### Temporal Coverage
- **Full year of data**: Not limited to specific year
- **Rolling window**: Always maintains 360 days from current date
- **Seasonal patterns**: Captures quarterly variations
- **Trend analysis**: Meaningful long-term insights

### Data Distribution
```
Daily Transactions: ~200-250
Monthly Volume: ~6,000-7,500
Quarterly Trends: Visible seasonality
Annual Coverage: Complete 360-day cycle
```

## 🎨 Visualization Enhancements

### 1. **Market Share Sankey Diagram**
- Flow visualization from segments to categories
- Revenue attribution paths
- Customer journey mapping

### 2. **Competitive Treemap**
- Hierarchical market share display
- Brand performance within segments
- Visual dominance indicators

### 3. **360-Day Time Series**
- Rolling average trends
- Segment performance over time
- Predictive trend lines

### 4. **Regional Heat Maps**
- Geographic market penetration
- JTI vs TBWA vs Competitors by region
- Urban vs rural dynamics

## 🤖 AI-Powered Insights

### Natural Language Queries (via RetailBot)
```
"How is JTI performing against its 40% target this month?"
"Which TBWA brands are underperforming?"
"Show me competitive threats in NCR region"
"What's driving evening sales for tobacco?"
```

### Automated Insights Generation
- Market share deviation alerts
- Performance anomaly detection
- Competitive threat identification
- Campaign effectiveness measurement

## 📊 Performance Metrics

### Handshake Scores by Segment
```
JTI:        0.70-0.85 (Premium loyalty)
TBWA:       0.60-0.75 (Strong preference)
Competitors: 0.40-0.65 (Price-driven)
```

### Campaign Attribution
```
JTI:        25% campaign-influenced
TBWA:       15% campaign-influenced  
Competitors: 5% campaign-influenced
```

### Branded Request Rates
```
JTI:        70% branded requests
TBWA:       55% branded requests
Competitors: 25% branded requests
```

## 🔧 Technical Implementation

### Database Schema Enhancements
```sql
-- Market segment tracking
ALTER TABLE master_brands ADD COLUMN market_segment TEXT;
ALTER TABLE master_brands ADD COLUMN is_jti_brand BOOLEAN;

-- Performance indexes
CREATE INDEX idx_market_segment ON master_brands(market_segment);
CREATE INDEX idx_scout_trans_360 ON scout_transactions(transaction_date)
    WHERE transaction_date >= CURRENT_DATE - INTERVAL '360 days';
```

### Materialized Views for Performance
- `scout_market_share_performance`
- `scout_jti_analysis`
- `scout_competitive_dashboard`
- `scout_360_day_trends`

### Query Optimization
- Sub-second response times
- Pre-computed aggregations
- Efficient window functions
- Optimized JOIN strategies

## 🎯 Business Value

### Strategic Insights
1. **JTI Portfolio Management**: Optimize tobacco brand mix
2. **TBWA Cross-Selling**: Identify opportunities across categories
3. **Competitive Response**: React to market share threats
4. **Regional Strategies**: Tailor approaches by geography

### Operational Benefits
1. **Real-time Monitoring**: Live market share tracking
2. **Alert Systems**: Automated deviation notifications
3. **Forecasting**: Predictive market share models
4. **Campaign ROI**: Measure marketing effectiveness

## 🚀 Next Steps

### Phase 1: Frontend Integration
- Update dashboard components for market segments
- Implement new visualization types
- Add market share KPI cards

### Phase 2: Advanced Analytics
- Predictive market share models
- Customer segment migration analysis
- Price elasticity by segment

### Phase 3: Automation
- Automated insight generation
- Market share alerts
- Performance reports
- Campaign recommendations

---

**Scout Dashboard v3.1.0** now provides **enterprise-grade retail intelligence** with authentic market dynamics, comprehensive competitive analysis, and actionable insights for strategic decision-making.