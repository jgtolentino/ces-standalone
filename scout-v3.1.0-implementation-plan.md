# Scout Analytics Dashboard v3.1.0 - Implementation Plan

## 🎯 Overview
Complete rebuild using Cruip Tailwind Dashboard Template with full backend integration.

## 📋 Requirements Checklist

### ✅ General Requirements
- [ ] No hardcoded mock data - all data from Supabase/API
- [ ] No Pulser/InsightPulseAI branding references
- [ ] Fully functional drill-downs
- [ ] Azure OpenAI integration with streaming insights
- [ ] Clean, production-ready filters
- [ ] QA validation for all widgets

### 🧭 Layout & Navigation
- [ ] Left sidebar navigation (collapsible with icon tooltips)
- [ ] Pages: Overview, Trends, Product Mix, Consumers, RetailBot
- [ ] Top horizontal filter bar (context-sensitive per section)
- [ ] Live Supabase query binding for all filters

### 🌍 Trends Page Requirements
- [ ] GeoHeatMap by region with population-weighted revenue
- [ ] Regional bar chart: Top 5 cities with barangay drill-down
- [ ] Click region → auto-apply filters navigation
- [ ] <5s render performance

### 🧺 Product Mix / Basket Share
- [ ] Treemaps for transaction share (size=volume, color=performance)
- [ ] Category Revenue Chart (bar chart, top 10)
- [ ] SKU Combo Network (or top 5 co-purchase table)
- [ ] Basket Size Distribution histogram

### 🔄 Sankey Substitution Flow
- [ ] Top 5 substitution patterns visualization
- [ ] Fallback: Simple table format

### 🤖 AI Assistant Panel
- [ ] LearnBot: Tooltip tutorials by section
- [ ] RetailBot: Validates metrics with context
- [ ] Hide: WriteBot, TestBot (dev only)
- [ ] Streaming server data insights
- [ ] Azure OpenAI → Supabase → SQL View → Prompt Engine

### 🎨 Advanced AI Insight Layer
- [ ] Emerging Cultural Signals box
- [ ] Color association analysis
- [ ] Generational link detection
- [ ] Nickname/alias recognition
- [ ] Brand loyalty signals

## 🛠️ Technical Stack

### Frontend
- Next.js 14 + TypeScript
- Cruip Tailwind Dashboard Template
- Chart.js for visualizations
- D3.js for Sankey diagrams
- Leaflet for GeoHeatMap

### Backend
- Supabase PostgreSQL
- Azure OpenAI integration
- Real-time WebSocket updates
- JWT authentication via KeyKey

### Data Flow
```
Supabase → API Routes → React Components → Chart Rendering
    ↓
Azure OpenAI → Insight Generation → UI Updates
```

## 📁 File Structure
```
app/
├── (dashboard)/
│   ├── layout.tsx          # Sidebar navigation
│   ├── page.tsx           # Overview
│   ├── trends/
│   │   └── page.tsx       # Regional maps
│   ├── products/
│   │   └── page.tsx       # Product mix/treemaps
│   ├── consumers/
│   │   └── page.tsx       # Consumer analytics
│   └── retailbot/
│       └── page.tsx       # AI assistant
├── api/
│   ├── regional-data/
│   ├── product-mix/
│   ├── substitution/
│   └── ai-insights/
components/
├── dashboard/
│   ├── Sidebar.tsx
│   ├── FilterBar.tsx
│   ├── GeoHeatMap.tsx
│   ├── TreemapChart.tsx
│   ├── SankeyDiagram.tsx
│   └── AIAssistantPanel.tsx
```

## 🚀 Implementation Steps

1. **Setup Cruip Template Base**
   - Clone dashboard structure
   - Remove demo content
   - Configure Tailwind

2. **Implement Navigation**
   - Sidebar component
   - Route structure
   - Filter bar system

3. **Data Integration**
   - Supabase connections
   - API route setup
   - Real-time subscriptions

4. **Chart Components**
   - GeoHeatMap
   - Treemaps
   - Sankey diagram
   - Standard charts

5. **AI Integration**
   - Azure OpenAI setup
   - Prompt templates
   - Streaming responses

6. **QA Validation**
   - Data accuracy tests
   - Performance benchmarks
   - UI/UX validation