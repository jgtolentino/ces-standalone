let
    // Dynamic Power BI function to fetch data from DAL endpoint
    // Usage: FetchFromDAL("kpi_revenue_2024") or FetchFromDAL("campaign_performance", [filters])
    FetchFromDAL = (datasetId as text, optional filters as record, optional queryType as text) =>
    let
        // Configuration
        BaseUrl = "{{DAL_ENDPOINT}}/api/powerbi/dal",
        BearerToken = "{{POWERBI_TOKEN}}",
        
        // Default values
        ActualFilters = if filters = null then [] else filters,
        ActualQueryType = if queryType = null then "main" else queryType,
        
        // Prepare request body
        RequestBody = [
            datasetId = datasetId,
            filters = ActualFilters,
            queryType = ActualQueryType
        ],
        
        // Convert to JSON
        JsonBody = Text.ToBinary(Json.FromValue(RequestBody)),
        
        // Make HTTP request with authentication
        Response = Web.Contents(BaseUrl, [
            Headers = [
                #"Content-Type" = "application/json",
                #"Authorization" = "Bearer " & BearerToken
            ],
            Content = JsonBody
        ]),
        
        // Parse JSON response
        JsonResponse = Json.Document(Response),
        
        // Extract data array
        DataArray = JsonResponse[data],
        
        // Convert to Power BI table
        DataTable = if DataArray = null or List.IsEmpty(DataArray) then
            #table({}, {})
        else
            Table.FromRecords(DataArray),
        
        // Add metadata columns
        EnrichedTable = Table.AddColumn(
            Table.AddColumn(
                Table.AddColumn(DataTable, "DatasetId", each datasetId),
                "QueryType", each ActualQueryType
            ),
            "LastRefresh", each DateTime.LocalNow()
        )
    in
        EnrichedTable,

    // Function metadata for Power BI
    FunctionType = type function (
        datasetId as (type text meta [
            Documentation.FieldCaption = "Dataset ID",
            Documentation.FieldDescription = "The ID of the dataset to fetch (e.g., 'kpi_revenue_2024', 'campaign_performance')",
            Documentation.SampleValues = {"kpi_revenue_2024", "campaign_performance", "audience_insights", "channel_analytics", "qa_validation_logs"}
        ]),
        optional filters as (type record meta [
            Documentation.FieldCaption = "Filters",
            Documentation.FieldDescription = "Optional filters to apply to the data query",
            Documentation.SampleValues = {[dateRange = [start = "2024-01-01", end = "2024-12-31"]], [channel = "Facebook"], [region = "US"]}
        ]),
        optional queryType as (type text meta [
            Documentation.FieldCaption = "Query Type", 
            Documentation.FieldDescription = "Type of query to execute (main, summary, demographics)",
            Documentation.SampleValues = {"main", "summary", "demographics"}
        ])
    ) as table meta [
        Documentation.Name = "Fetch From DAL",
        Documentation.Description = "Fetches data from the Scout Analytics Data Abstraction Layer (DAL) endpoint",
        Documentation.LongDescription = "This function connects to the Scout Analytics DAL endpoint to retrieve dataset information. It supports multiple datasets including revenue KPIs, campaign performance, audience insights, channel analytics, and QA validation logs.",
        Documentation.Category = "Scout Analytics",
        Documentation.Source = "Scout CDB Platform",
        Documentation.Version = "1.0.0",
        Documentation.Author = "Scout Analytics Team",
        Documentation.Examples = {[
            Description = "Fetch revenue KPIs for 2024",
            Code = "FetchFromDAL(""kpi_revenue_2024"")",
            Result = "Table with revenue, transactions, AOV, margin, and ROI data"
        ], [
            Description = "Fetch campaign performance with date filter",
            Code = "FetchFromDAL(""campaign_performance"", [dateRange = [start = ""2024-01-01"", end = ""2024-03-31""]])",
            Result = "Table with filtered campaign performance metrics"
        ], [
            Description = "Fetch audience demographics summary",
            Code = "FetchFromDAL(""audience_insights"", [], ""demographics"")",
            Result = "Table with demographic breakdown and performance scores"
        ]}
    ]

in
    Value.ReplaceType(FetchFromDAL, FunctionType)
