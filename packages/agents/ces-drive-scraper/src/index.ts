import { google } from 'googleapis';
import { createClient } from '@ai/db';
import cron from 'node-cron';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink: string;
  downloadUrl?: string;
}

export interface ScrapedFileRecord {
  file_id: string;
  file_name: string;
  mime_type: string;
  file_size?: number;
  modified_time: string;
  web_view_link: string;
  download_url?: string;
  tenant_id: string;
  processed: boolean;
  scraped_at: string;
}

export class CESDriveScraper {
  private drive: any;
  private supabase: ReturnType<typeof createClient>;
  private tenantId: string;

  constructor(tenantId: string = 'ces') {
    this.tenantId = tenantId;
    this.supabase = createClient();
    
    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
    });
    
    this.drive = google.drive({ version: 'v3', auth });
  }

  /**
   * Scrape new files from Google Drive folder
   */
  async scrapeNewFiles(folderId?: string): Promise<DriveFile[]> {
    try {
      console.log(`🔍 Scanning Google Drive for new files (tenant: ${this.tenantId})`);
      
      // Get list of files from Drive
      const response = await this.drive.files.list({
        q: folderId ? `'${folderId}' in parents` : undefined,
        fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 100,
      });

      const files: DriveFile[] = response.data.files || [];
      
      // Filter out files we've already processed
      const newFiles = await this.filterNewFiles(files);
      
      console.log(`📁 Found ${newFiles.length} new files to process`);
      return newFiles;
      
    } catch (error) {
      console.error('❌ Error scraping Drive files:', error);
      throw error;
    }
  }

  /**
   * Filter out files that have already been processed
   */
  private async filterNewFiles(files: DriveFile[]): Promise<DriveFile[]> {
    if (files.length === 0) return [];

    const fileIds = files.map(f => f.id);
    
    const { data: existingFiles } = await this.supabase
      .from('drive_monitor')
      .select('file_id')
      .in('file_id', fileIds)
      .eq('tenant_id', this.tenantId);

    const existingFileIds = new Set(existingFiles?.map(f => f.file_id) || []);
    
    return files.filter(file => !existingFileIds.has(file.id));
  }

  /**
   * Store scraped files in the monitor table
   */
  async storeFiles(files: DriveFile[]): Promise<void> {
    if (files.length === 0) return;

    const records: Omit<ScrapedFileRecord, 'id'>[] = files.map(file => ({
      file_id: file.id,
      file_name: file.name,
      mime_type: file.mimeType,
      file_size: file.size ? parseInt(file.size) : undefined,
      modified_time: file.modifiedTime,
      web_view_link: file.webViewLink,
      download_url: file.downloadUrl,
      tenant_id: this.tenantId,
      processed: false,
      scraped_at: new Date().toISOString(),
    }));

    const { error } = await this.supabase
      .from('drive_monitor')
      .insert(records);

    if (error) {
      console.error('❌ Error storing files:', error);
      throw error;
    }

    console.log(`✅ Stored ${files.length} new files in monitor table`);
  }

  /**
   * Get unprocessed files for processing pipeline
   */
  async getUnprocessedFiles(): Promise<ScrapedFileRecord[]> {
    const { data, error } = await this.supabase
      .from('drive_monitor')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('processed', false)
      .order('scraped_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching unprocessed files:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Mark files as processed
   */
  async markFilesProcessed(fileIds: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('drive_monitor')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .in('file_id', fileIds)
      .eq('tenant_id', this.tenantId);

    if (error) {
      console.error('❌ Error marking files as processed:', error);
      throw error;
    }

    console.log(`✅ Marked ${fileIds.length} files as processed`);
  }

  /**
   * Run full scrape and store cycle
   */
  async runScrapeJob(folderId?: string): Promise<void> {
    try {
      console.log(`🚀 Starting Drive scrape job for tenant: ${this.tenantId}`);
      
      const newFiles = await this.scrapeNewFiles(folderId);
      await this.storeFiles(newFiles);
      
      console.log(`🎉 Scrape job completed successfully`);
    } catch (error) {
      console.error('❌ Scrape job failed:', error);
      throw error;
    }
  }

  /**
   * Start scheduled monitoring
   */
  startScheduledMonitoring(schedule: string = '0 */15 * * * *', folderId?: string): void {
    console.log(`⏰ Starting scheduled monitoring (${schedule}) for tenant: ${this.tenantId}`);
    
    cron.schedule(schedule, async () => {
      try {
        await this.runScrapeJob(folderId);
      } catch (error) {
        console.error('❌ Scheduled scrape job failed:', error);
      }
    });
  }
}

// Export factory function for easy usage
export function createCESDriveScraper(tenantId: string = 'ces') {
  return new CESDriveScraper(tenantId);
}

// CLI interface
if (require.main === module) {
  const scraper = new CESDriveScraper();
  
  if (process.argv.includes('--monitor')) {
    scraper.startScheduledMonitoring();
  } else {
    scraper.runScrapeJob().catch(console.error);
  }
}