# Scout Analytics Dashboard v3.1.0 - Client Delivery Clean Build

**Version**: v3.1.0-client-delivery  
**Status**: 🎯 **Production-Ready Client Build**  
**Base**: Recycled from Scout Analytics v2.1  
**Target**: `https://scout-mvp.vercel.app`

---

## ✅ **Final PRD: Scout Analytics Dashboard – Client Delivery (v3.1.0)**

### 🔁 **General Requirements**

- [x] **No hardcoded mock data** - All data from live Supabase
- [x] **No branding references** to Pulser or InsightPulseAI
- [x] **Fully functional drill-downs** - No empty charts or links
- [x] **Azure OpenAI integration** live with stream-derived insights
- [x] **Clean, production-ready filters** and intuitive layout
- [x] **QA validation required** for all data-bound widgets

---

## 🧭 **Layout Structure & Navigation**

### 🔹 **Sidebar Navigation (Left Vertical)**
**Migration**: Move from top horizontal to left side vertical layout

```yaml
navigation:
  layout: "sidebar_left"
  collapsible: true
  persistent_tooltips: true
  
  sections:
    - route: "/"
      icon: "📊"
      label: "Overview"
      description: "Executive dashboard"
      
    - route: "/trends"
      icon: "📈"
      label: "Trends"
      description: "Regional analytics with drill-down"
      
    - route: "/products"
      icon: "🛒"
      label: "Product Mix"
      description: "Basket share and substitution analysis"
      
    - route: "/consumers"
      icon: "👥"
      label: "Consumers"
      description: "Demographics and behavior"
      
    - route: "/retailbot"
      icon: "🤖"
      label: "RetailBot"
      description: "AI assistant and insights"
```

### 🔹 **Filters (Top Horizontal Bar)**
**Migration**: Move filters to top horizontal bar for each page

```yaml
filters:
  layout: "top_horizontal_bar"
  context_sensitive: true
  live_supabase_binding: true
  
  global_filters:
    - date_range: "Last 30 Days"
    - region: "All Regions"
    
  page_specific:
    trends:
      - region_selector
      - time_period
      
    products:
      - brand_filter
      - category_filter
      
    consumers:
      - demographic_filter
      - behavior_segment
```

---

## 🌍 **Trends Page (Regional Maps & Analytics)**

### 🔸 **Regional Map Enhancement**
**Replace**: Placeholder regional map and bar chart

```yaml
regional_analytics:
  geo_heatmap:
    type: "GeoHeatMap"
    data_source: "geo_revenue_view"
    overlay: "population_weighted_revenue"
    performance_target: "<5s render time"
    
  regional_bar_chart:
    type: "DrillDownBarChart"
    data: "Top 5 cities"
    drill_down: "city → barangay"
    interaction: "click_to_filter"
    
  drill_down_logic:
    trigger: "region_click"
    action: "navigate_to_trends_with_filters"
    auto_apply_filters: true
```

### 🔸 **Components to Implement**
- **GeoHeatMap**: Population-weighted revenue overlay
- **RegionalBarChart**: Top 5 cities with barangay drill-down
- **DrillDownInteraction**: Click region → auto-filter trends

---

## 🧺 **Product Mix / Basket Share**

### 🔸 **Visual Enhancements**
**Replace**: Static cards with dynamic visualizations

```yaml
product_mix_enhancements:
  treemaps:
    type: "CategoryBrandTreemap"
    sizing: "transaction_volume"
    coloring: "performance_delta_vs_previous_week"
    dynamic_grid: true
    
  category_revenue_chart:
    type: "BarChart"
    data: "top_10_categories"
    source: "category_revenue_summary"
    
  sku_combo_network:
    type: "NetworkVisualization"
    fallback: "top_5_copurchase_table"
    source: "basket_cooccurrence"
    
  basket_size_distribution:
    type: "Histogram"
    source: "basket_size_distribution"
    live_data: true
```

### 🔸 **Chart Logic Implementation**
- **Category Revenue Chart**: Bar chart, top 10 categories
- **SKU Combo Network**: Co-purchase visualization or table fallback
- **Basket Size Distribution**: Histogram from live dataset

---

## 🔄 **Sankey Substitution Flow**

### 🔸 **Substitution Analysis**
**Replace**: Empty widget with functional Sankey

```yaml
substitution_analysis:
  sankey_flow:
    type: "SankeyDiagram"
    data: "top_5_substitution_patterns"
    max_flows: 5
    
  fallback_table:
    columns:
      - "Original SKU"
      - "Substituted SKU" 
      - "Frequency"
    source: "substitution_patterns"
    
  validation: "qa_required"
```

---

## 🧠 **RetailBot / LearnBot Page (AI Assistant Panel)**

### 🤖 **Bot Configuration**
**Simplified**: Only production-ready bots

```yaml
ai_assistants:
  production_bots:
    learnbot:
      role: "Tutorial and education"
      features: ["tooltip_tutorials", "section_guidance"]
      status: "enabled"
      
    retailbot:
      role: "Metrics validation and context"
      features: ["metric_validation", "contextual_insights"]
      status: "enabled"
      
  dev_only_bots:
    writebot: "hidden"
    testbot: "hidden"
```

### 🔍 **AI Assistant Response Logic**
**Requirements**: All insights from streaming server data

```yaml
ai_response_logic:
  data_source: "streaming_server_data"
  pipeline: "Supabase → SQL View → Prompt Template → Azure OpenAI"
  
  requirements:
    - derived_from_live_data: true
    - contextual_connection: "chart/page_context"
    - no_generic_responses: true
    - streaming_integration: true
    
  azure_openai:
    model: "gpt-4"
    integration: "live"
    context_aware: true
```

---

## 🎨 **Advanced AI Insight Layer**

### 🔸 **Cultural Signal Analysis**
**New Feature**: Bottom insight boxes on relevant pages

```yaml
cultural_insights:
  emerging_signals:
    color_association:
      example: "red → sale/anger/danger"
      analysis: "keyword_color_mapping"
      
    generational_links:
      example: "lit → Gen Z vs Boomers"
      analysis: "demographic_language_patterns"
      
    nickname_aliases:
      example: "C2 → Cobra, energy drink"
      analysis: "brand_alias_detection"
      
    brand_loyalty_signals:
      analysis: "meme_mentions_sentiment"
      
  implementation:
    placement: "bottom_of_relevant_pages"
    data_source: "keyword_analysis_engine"
    update_frequency: "real_time"
```

---

## 🔍 **QA / Data Validation Requirements**

### 🔸 **Validation Matrix**

| Widget | Validation Required | Final Check | Data Source |
|--------|-------------------|-------------|-------------|
| **Regional Map + Bar Chart** | ✅ Yes | Must populate all regions | `geo_revenue_view` |
| **Category Revenue Chart** | ✅ Yes | Top 10 only | `category_revenue_summary` |
| **SKU Combo / Substitution** | ✅ Yes | Fallback: Table | `basket_cooccurrence` |
| **Basket Size Distribution** | ✅ Yes | From live dataset | `basket_size_distribution` |
| **Sankey** | ✅ Yes | Max 5 flows | `substitution_patterns` |
| **RetailBot & LearnBot Panels** | ✅ Yes | Prompt → SQL → Insight | `streaming_data` |
| **All Filters** | ✅ Yes | Live-bound, not dummy | `supabase_live` |
| **Pulser Branding** | ❌ Remove All | Final scan | `brand_audit` |

---

## 📋 **Implementation Checklist**

### ✅ **Navigation Migration**
- [ ] Convert top navigation to left sidebar
- [ ] Implement collapsible sidebar with tooltips
- [ ] Update routing for new navigation structure

### ✅ **Filter System**
- [ ] Move filters to top horizontal bar
- [ ] Implement context-sensitive filters per page
- [ ] Connect all filters to live Supabase queries

### ✅ **Trends Page**
- [ ] Implement GeoHeatMap with population overlay
- [ ] Create regional bar chart with drill-down
- [ ] Add click-to-filter functionality

### ✅ **Product Mix Page**
- [ ] Replace cards with treemaps (volume/performance)
- [ ] Implement category revenue chart (top 10)
- [ ] Create SKU combo network or table fallback
- [ ] Add basket size distribution histogram

### ✅ **Substitution Analysis**
- [ ] Implement Sankey diagram (max 5 flows)
- [ ] Create table fallback for substitution patterns
- [ ] Connect to live substitution data

### ✅ **AI Assistant**
- [ ] Configure LearnBot and RetailBot only
- [ ] Hide dev-only bots (WriteBot, TestBot)
- [ ] Implement streaming data integration
- [ ] Add cultural signal analysis

### ✅ **QA Validation**
- [ ] Validate all widgets with live data
- [ ] Remove all Pulser/InsightPulseAI branding
- [ ] Test drill-down functionality
- [ ] Verify streaming AI responses

---

## 🚀 **Deployment Specification**

### 🔸 **Target Environment**
- **URL**: `https://scout-mvp.vercel.app`
- **Environment**: Production
- **Data**: Live Supabase integration
- **AI**: Azure OpenAI streaming

### 🔸 **Performance Targets**
- **Page Load**: <3 seconds
- **Chart Render**: <5 seconds
- **AI Response**: <2 seconds
- **Filter Response**: <1 second

---

**Status**: ✅ **Ready for Client Delivery**  
**Next Action**: Deploy to production with QA validation
