let
    // Enhanced Power BI function to fetch data from DAL endpoint with pagination and host switching
    // Usage: FetchFromDAL("kpi_revenue_2024") or FetchFromDAL("campaign_performance", [filters], "main", [Host="https://scout-mvp.vercel.app"])
    FetchFromDAL = (datasetId as text, optional filters as record, optional queryType as text, optional options as record) =>
    let
        // Configuration with host override support
        DefaultHost = "https://scout-mvp.vercel.app",
        ActualHost = if options <> null and Record.HasFields(options, "Host") then options[Host] else DefaultHost,
        BaseUrl = ActualHost & "/api/powerbi/dal",
        BearerToken = "{{POWERBI_TOKEN}}",
        
        // Default values
        ActualFilters = if filters = null then [] else filters,
        ActualQueryType = if queryType = null then "main" else queryType,
        
        // Meta discovery function - call when datasetId is empty to get available datasets
        GetAvailableDatasets = () =>
        let
            MetaResponse = Web.Contents(BaseUrl & "?meta=true", [
                Headers = [
                    #"Authorization" = "Bearer " & BearerToken
                ]
            ]),
            MetaJson = Json.Document(MetaResponse),
            DatasetList = MetaJson[datasets],
            SchemaInfo = MetaJson[schemas],
            
            // Create a table showing available datasets
            DatasetTable = Table.FromRecords(
                List.Transform(DatasetList, each [
                    DatasetId = _,
                    Description = SchemaInfo[_][description]?,
                    Source = SchemaInfo[_][source]?,
                    AvailableQueries = Text.Combine(SchemaInfo[_][availableQueries]?, ", ")
                ])
            )
        in
            DatasetTable,
        
        // Paginated fetch function
        FetchWithPagination = (url as text) =>
        let
            Response = Web.Contents(url, [
                Headers = [
                    #"Content-Type" = "application/json",
                    #"Authorization" = "Bearer " & BearerToken
                ],
                Content = Text.ToBinary(Json.FromValue([
                    datasetId = datasetId,
                    filters = ActualFilters,
                    queryType = ActualQueryType
                ]))
            ]),
            
            JsonResponse = Json.Document(Response),
            DataArray = JsonResponse[data],
            Metadata = JsonResponse[metadata],
            
            // Convert to Power BI table
            DataTable = if DataArray = null or List.IsEmpty(DataArray) then
                #table({}, {})
            else
                Table.FromRecords(DataArray),
            
            // Check for next page header
            ResponseHeaders = Value.Metadata(Response)[Headers]?,
            NextPageUrl = if ResponseHeaders <> null then ResponseHeaders[#"x-next-page"]? else null,
            
            // Add metadata columns
            EnrichedTable = Table.AddColumn(
                Table.AddColumn(
                    Table.AddColumn(
                        Table.AddColumn(DataTable, "DatasetId", each datasetId),
                        "QueryType", each ActualQueryType
                    ),
                    "LastRefresh", each DateTime.LocalNow()
                ),
                "PageInfo", each [
                    Page = Metadata[page]?,
                    PageSize = Metadata[pageSize]?,
                    TotalRecords = Metadata[totalRecords]?,
                    HasNextPage = Metadata[hasNextPage]?
                ]
            ),
            
            // Recursively fetch next pages if they exist
            FinalTable = if NextPageUrl <> null then
                Table.Combine({EnrichedTable, @FetchWithPagination(ActualHost & NextPageUrl)})
            else
                EnrichedTable
        in
            FinalTable
    in
        // Return dataset list if no datasetId provided, otherwise fetch data
        if datasetId = "" or datasetId = null then
            GetAvailableDatasets()
        else
            FetchWithPagination(BaseUrl),

    // Function metadata for Power BI
    FunctionType = type function (
        datasetId as (type text meta [
            Documentation.FieldCaption = "Dataset ID",
            Documentation.FieldDescription = "The ID of the dataset to fetch. Leave empty to see available datasets.",
            Documentation.SampleValues = {"kpi_revenue_2024", "campaign_performance", "audience_insights", "channel_analytics", "qa_validation_logs", ""}
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
        ]),
        optional options as (type record meta [
            Documentation.FieldCaption = "Options",
            Documentation.FieldDescription = "Additional options including Host override for environment switching",
            Documentation.SampleValues = {[Host = "https://scout-mvp-git-preview.vercel.app"], [Host = "https://scout-mvp.vercel.app"]}
        ])
    ) as table meta [
        Documentation.Name = "Fetch From DAL v2",
        Documentation.Description = "Enhanced function to fetch data from the Scout Analytics Data Abstraction Layer (DAL) endpoint with pagination and environment switching support",
        Documentation.LongDescription = "This function connects to the Scout Analytics DAL endpoint to retrieve dataset information. It supports multiple datasets, automatic pagination for large datasets, environment switching via Host parameter, and dataset discovery when called with empty datasetId.",
        Documentation.Category = "Scout Analytics",
        Documentation.Source = "Scout CDB Platform",
        Documentation.Version = "2.0.0",
        Documentation.Author = "Scout Analytics Team",
        Documentation.Examples = {[
            Description = "Discover available datasets",
            Code = "FetchFromDAL("""")",
            Result = "Table listing all available datasets with descriptions"
        ], [
            Description = "Fetch revenue KPIs for 2024",
            Code = "FetchFromDAL(""kpi_revenue_2024"")",
            Result = "Table with revenue, transactions, AOV, margin, and ROI data (auto-paginated)"
        ], [
            Description = "Fetch from preview environment",
            Code = "FetchFromDAL(""campaign_performance"", [], ""main"", [Host = ""https://scout-mvp-git-preview.vercel.app""])",
            Result = "Table with campaign performance from preview environment"
        ], [
            Description = "Fetch audience demographics summary",
            Code = "FetchFromDAL(""audience_insights"", [], ""demographics"")",
            Result = "Table with demographic breakdown and performance scores"
        ]}
    ]

in
    Value.ReplaceType(FetchFromDAL, FunctionType)
