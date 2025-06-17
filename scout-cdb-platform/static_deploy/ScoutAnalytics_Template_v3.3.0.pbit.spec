{
  "version": "3.3.0",
  "name": "Scout Analytics Template",
  "description": "Power BI template with Scout Advisor UI theme and live DAL connectivity",
  "author": "Scout Analytics Team",
  "created": "2025-06-17",
  "type": "pbit",
  
  "parameters": {
    "DAL_ENDPOINT": {
      "type": "text",
      "description": "Scout Analytics DAL API endpoint",
      "example": "https://scout-analytics.vercel.app/api/powerbi/dal",
      "required": true
    },
    "POWERBI_TOKEN": {
      "type": "text",
      "description": "Bearer token for DAL authentication",
      "example": "scout-powerbi-secret-token",
      "required": true,
      "sensitive": true
    }
  },
  
  "dataModel": {
    "tables": [
      {
        "name": "DatasetSelector",
        "description": "Available datasets for dynamic selection",
        "columns": [
          {"name": "datasetId", "dataType": "string"},
          {"name": "description", "dataType": "string"},
          {"name": "source", "dataType": "string"},
          {"name": "category", "dataType": "string"}
        ],
        "data": [
          {
            "datasetId": "kpi_revenue_2024",
            "description": "Revenue, Transactions, AOV, Margin",
            "source": "Supabase",
            "category": "Financial"
          },
          {
            "datasetId": "campaign_performance", 
            "description": "CTR, ROI, Impressions, CPC",
            "source": "Azure SQL",
            "category": "Marketing"
          },
          {
            "datasetId": "audience_insights",
            "description": "Age, Gender, Region, Income",
            "source": "Supabase", 
            "category": "Demographics"
          },
          {
            "datasetId": "channel_analytics",
            "description": "Media channel metrics (FB, IG, TV, In-store)",
            "source": "Azure SQL",
            "category": "Channels"
          },
          {
            "datasetId": "qa_validation_logs",
            "description": "UI audit trail from Caca + VibeTestBot",
            "source": "Audit DB",
            "category": "Quality"
          }
        ]
      }
    ],
    
    "queries": [
      {
        "name": "FetchFromDAL",
        "description": "Dynamic function to fetch data from Scout Analytics DAL",
        "formula": "let\n    FetchFromDAL = (datasetId as text, optional filters as record, optional queryType as text) =>\n    let\n        BaseUrl = #\"DAL_ENDPOINT\",\n        BearerToken = #\"POWERBI_TOKEN\",\n        ActualFilters = if filters = null then [] else filters,\n        ActualQueryType = if queryType = null then \"main\" else queryType,\n        RequestBody = [\n            datasetId = datasetId,\n            filters = ActualFilters,\n            queryType = ActualQueryType\n        ],\n        JsonBody = Text.ToBinary(Json.FromValue(RequestBody)),\n        Response = Web.Contents(BaseUrl, [\n            Headers = [\n                #\"Content-Type\" = \"application/json\",\n                #\"Authorization\" = \"Bearer \" & BearerToken\n            ],\n            Content = JsonBody\n        ]),\n        JsonResponse = Json.Document(Response),\n        DataArray = JsonResponse[data],\n        DataTable = if DataArray = null or List.IsEmpty(DataArray) then\n            #table({}, {})\n        else\n            Table.FromRecords(DataArray),\n        EnrichedTable = Table.AddColumn(\n            Table.AddColumn(\n                Table.AddColumn(DataTable, \"DatasetId\", each datasetId),\n                \"QueryType\", each ActualQueryType\n            ),\n            \"LastRefresh\", each DateTime.LocalNow()\n        )\n    in\n        EnrichedTable\nin\n    FetchFromDAL"
      }
    ]
  },
  
  "pages": [
    {
      "name": "Executive Overview",
      "description": "Revenue, AOV, KPI cards, region trends",
      "visuals": [
        {
          "type": "card",
          "title": "Total Revenue",
          "data": "FetchFromDAL(\"kpi_revenue_2024\")",
          "measure": "SUM(revenue)",
          "format": "currency"
        },
        {
          "type": "card", 
          "title": "Average Order Value",
          "data": "FetchFromDAL(\"kpi_revenue_2024\")",
          "measure": "AVERAGE(aov)",
          "format": "currency"
        },
        {
          "type": "card",
          "title": "Total Transactions", 
          "data": "FetchFromDAL(\"kpi_revenue_2024\")",
          "measure": "SUM(transactions)",
          "format": "number"
        },
        {
          "type": "lineChart",
          "title": "Revenue Trend",
          "data": "FetchFromDAL(\"kpi_revenue_2024\")",
          "x": "date",
          "y": "revenue"
        },
        {
          "type": "map",
          "title": "Regional Performance",
          "data": "FetchFromDAL(\"audience_insights\", [], \"demographics\")",
          "location": "region",
          "size": "count"
        }
      ]
    },
    {
      "name": "Product Performance",
      "description": "Category breakdown, margin vs volume",
      "visuals": [
        {
          "type": "columnChart",
          "title": "Revenue by Category",
          "data": "FetchFromDAL(\"kpi_revenue_2024\")",
          "x": "category",
          "y": "revenue"
        },
        {
          "type": "scatterChart",
          "title": "Margin vs Volume",
          "data": "FetchFromDAL(\"kpi_revenue_2024\")",
          "x": "transactions",
          "y": "margin",
          "size": "revenue"
        }
      ]
    },
    {
      "name": "Customer Analytics", 
      "description": "Segments, demographics, geographic distribution",
      "visuals": [
        {
          "type": "pieChart",
          "title": "Age Distribution",
          "data": "FetchFromDAL(\"audience_insights\", [], \"demographics\")",
          "category": "age_range",
          "value": "count"
        },
        {
          "type": "barChart",
          "title": "Gender Performance",
          "data": "FetchFromDAL(\"audience_insights\", [], \"demographics\")",
          "x": "gender",
          "y": "performance_score"
        }
      ]
    },
    {
      "name": "Trends & Forecasting",
      "description": "6-month forecast, seasonal charts",
      "visuals": [
        {
          "type": "lineChart",
          "title": "6-Month Revenue Forecast",
          "data": "FetchFromDAL(\"kpi_revenue_2024\")",
          "x": "date",
          "y": "revenue",
          "forecast": true
        }
      ]
    },
    {
      "name": "AI Insights",
      "description": "Smart narrative, anomaly detection, GPT cards",
      "visuals": [
        {
          "type": "textBox",
          "title": "AI-Generated Insights",
          "content": "Dynamic insights based on current data trends"
        }
      ]
    },
    {
      "name": "Platform Notes",
      "description": "CDB schema, agent logs, QA audit matrix",
      "visuals": [
        {
          "type": "table",
          "title": "QA Validation Logs",
          "data": "FetchFromDAL(\"qa_validation_logs\")",
          "columns": ["test_type", "validation_result", "confidence_score", "created_at"]
        }
      ]
    }
  ],
  
  "theme": {
    "file": "pbix_config_scout_advisor.json",
    "features": [
      "Navigation bar blue (#1D4ED8) matching Scout Advisor UI",
      "KPI highlight cards with semantic colors",
      "Inter font family integration", 
      "Professional card styling and spacing"
    ]
  },
  
  "slicers": [
    {
      "name": "Dataset Selector",
      "table": "DatasetSelector",
      "field": "datasetId",
      "type": "dropdown",
      "defaultValue": "kpi_revenue_2024",
      "position": "top"
    },
    {
      "name": "Date Range",
      "type": "dateRange",
      "defaultValue": "last30days"
    }
  ],
  
  "security": {
    "authentication": "parameter-based",
    "encryption": "https-only",
    "tokenStorage": "parameter",
    "dataProtection": "environment-isolated"
  },
  
  "compatibility": {
    "powerBiDesktop": ">=2.0",
    "powerBiService": ">=1.0",
    "browsers": ["Chrome", "Firefox", "Safari", "Edge"]
  }
}
