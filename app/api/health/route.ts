import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection } from '../../../lib/database';

export async function GET(request: NextRequest) {
  const databaseStatus = await checkDatabaseConnection();
  
  // In a real scenario, you'd also check Azure OpenAI and Google Drive API status
  const azureOpenAIStatus = process.env.AZURE_OPENAI_API_KEY ? "configured" : "not configured";
  const googleDriveStatus = process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? "configured" : "not configured";

  const status = databaseStatus && azureOpenAIStatus === "configured" && googleDriveStatus === "configured" ? "healthy" : "unhealthy";

  return NextResponse.json({
    status,
    system_type: "TBWA Creative Campaign Analysis",
    campaign_tables: databaseStatus ? "ready" : "not ready", // Assumes tables are ready if DB is connected
    services: {
      azure_sql: databaseStatus ? "operational" : "down",
      azure_openai: azureOpenAIStatus,
      google_drive: googleDriveStatus,
    },
    timestamp: new Date().toISOString(),
  }, { status: status === "healthy" ? 200 : 503 });
} 