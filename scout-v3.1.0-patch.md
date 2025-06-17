# Scout Analytics v3.1.0 - Simple Patch Implementation

## 🎯 Patch Objectives
Transform existing dashboard with minimal changes:
- Move navigation to left sidebar
- Add horizontal filter bar  
- Replace empty widgets with functional charts
- Integrate Azure OpenAI for RetailBot
- Remove Pulser branding

## 📝 Patch Changes Required

### 1. Navigation Patch
**File: `app/layout.tsx`**
```typescript
// PATCH: Add sidebar navigation component
import Sidebar from '@/components/Sidebar'

// PATCH: Change layout to sidebar + main content
```

### 2. Filter Bar Patch  
**Files: All dashboard pages**
```typescript
// PATCH: Add horizontal filter bar to each page
import FilterBar from '@/components/FilterBar'

// PATCH: Add filter state management
const [filters, setFilters] = useState({
  timeframe: '30d',
  region: 'all' 
})
```

### 3. Regional Map Patch
**File: `app/trends/page.tsx`**
```typescript
// PATCH: Replace placeholder map with functional GeoHeatMap
// PATCH: Add drill-down to city level
// PATCH: Connect to Supabase regional data
```

### 4. Product Mix Patch
**File: `app/products/page.tsx`**  
```typescript
// PATCH: Replace cards with treemap visualization
// PATCH: Add Sankey diagram for substitution
// PATCH: Connect to real product data
```

### 5. AI RetailBot Patch
**File: `app/retailbot/page.tsx`** (new)
```typescript
// PATCH: Add Azure OpenAI integration
// PATCH: Create LearnBot tutorial system
// PATCH: Remove WriteBot/TestBot references
```

### 6. Branding Cleanup Patch
**Files: All components**
```typescript
// PATCH: Remove "Pulser" and "InsightPulseAI" references
// PATCH: Change to "Scout Analytics" branding
```

## 🚀 Implementation Priority

1. **HIGH**: Navigation sidebar + filter bars
2. **HIGH**: Remove Pulser branding  
3. **MEDIUM**: Functional regional map
4. **MEDIUM**: Product treemaps
5. **LOW**: Sankey diagrams
6. **LOW**: AI RetailBot integration

## 💡 Patch Strategy
- Reuse existing components where possible
- Minimal file changes
- Keep existing API endpoints
- Progressive enhancement approach