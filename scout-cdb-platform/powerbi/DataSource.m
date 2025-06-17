let
    // Scout Analytics Power BI Data Source Connector
    // This M query connects to the DAL (Data Abstraction Layer) via REST
    // Replace {{DAL_ENDPOINT}} and {{POWERBI_TOKEN}} with actual values during deployment
    
    Source = Json.Document(Web.Contents("{{DAL_ENDPOINT}}/api/powerbi/dal", [
        Headers = [
            #"Content-Type" = "application/json",
            #"Authorization" = "Bearer {{POWERBI_TOKEN}}"
        ],
        Content = Text.ToBinary("{""datasetId"":""kpi_revenue_2024"",""filters"":{}}")
    ])),
    
    // Extract the data array from the response
    Data = Source[data],
    
    // Convert to Power BI table
    DataTable = if Data = null or List.IsEmpty(Data) then
        #table({}, {})
    else
        Table.FromRecords(Data),
    
    // Add metadata for traceability
    EnrichedTable = Table.AddColumn(
        Table.AddColumn(
            Table.AddColumn(DataTable, "DataSource", each "Scout Analytics DAL"),
            "DatasetId", each Source[datasetId]?
        ),
        "LastRefresh", each DateTime.LocalNow()
    )
in
    EnrichedTable
