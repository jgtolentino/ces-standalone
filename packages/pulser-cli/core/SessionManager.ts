import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { debug } from 'debug';

const log = debug('pulser:session');

export interface Session {
  id: string;
  created: Date;
  lastModified: Date;
  messages: SessionMessage[];
  metadata: SessionMetadata;
}

export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  executionPlan?: any;
}

export interface SessionMetadata {
  tenant?: string;
  mode: string;
  totalMessages: number;
  totalTokens?: number;
  cost?: number;
}

export class SessionManager {
  private sessionsDir: string;

  constructor(sessionsDir?: string) {
    this.sessionsDir = sessionsDir || path.join(process.env.HOME || '', '.pulser', 'sessions');
    this.ensureSessionsDir();
  }

  private ensureSessionsDir(): void {
    try {
      fs.ensureDirSync(this.sessionsDir);
      log('Sessions directory ensured:', this.sessionsDir);
    } catch (error) {
      log('Failed to create sessions directory:', error);
      throw new Error(`Cannot create sessions directory: ${error.message}`);
    }
  }

  async createSession(metadata: Partial<SessionMetadata> = {}): Promise<Session> {
    const sessionId = uuidv4();
    const now = new Date();
    
    const session: Session = {
      id: sessionId,
      created: now,
      lastModified: now,
      messages: [],
      metadata: {
        mode: metadata.mode || 'hybrid',
        totalMessages: 0,
        totalTokens: 0,
        cost: 0,
        ...metadata
      }
    };

    await this.saveSession(session);
    log('Created new session:', sessionId);
    
    return session;
  }

  async resumeSession(sessionId: string): Promise<Session> {
    const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
    
    try {
      const sessionData = await fs.readJSON(sessionPath);
      const session: Session = {
        ...sessionData,
        created: new Date(sessionData.created),
        lastModified: new Date(sessionData.lastModified),
        messages: sessionData.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
      
      log('Resumed session:', sessionId);
      return session;
    } catch (error) {
      log('Failed to resume session:', sessionId, error);
      throw new Error(`Session not found: ${sessionId}`);
    }
  }

  async saveSession(session: Session): Promise<void> {
    const sessionPath = path.join(this.sessionsDir, `${session.id}.json`);
    
    try {
      await fs.writeJSON(sessionPath, session, { spaces: 2 });
      log('Saved session:', session.id);
    } catch (error) {
      log('Failed to save session:', session.id, error);
      throw new Error(`Cannot save session: ${error.message}`);
    }
  }

  async addToSession(sessionId: string, userInput: string, assistantResponse: string, executionPlan?: any): Promise<void> {
    try {
      const session = await this.resumeSession(sessionId);
      
      const now = new Date();
      
      // Add user message
      session.messages.push({
        role: 'user',
        content: userInput,
        timestamp: now
      });
      
      // Add assistant message
      session.messages.push({
        role: 'assistant',
        content: assistantResponse,
        timestamp: now,
        executionPlan
      });
      
      // Update metadata
      session.lastModified = now;
      session.metadata.totalMessages = session.messages.length;
      
      await this.saveSession(session);
      log('Added messages to session:', sessionId);
      
    } catch (error) {
      log('Failed to add to session:', sessionId, error);
      throw new Error(`Cannot update session: ${error.message}`);
    }
  }

  async listSessions(): Promise<Array<{ id: string; created: Date; lastModified: Date; messageCount: number }>> {
    try {
      const files = await fs.readdir(this.sessionsDir);
      const sessionFiles = files.filter(file => file.endsWith('.json'));
      
      const sessions = await Promise.all(
        sessionFiles.map(async (file) => {
          const sessionId = path.basename(file, '.json');
          const sessionPath = path.join(this.sessionsDir, file);
          
          try {
            const sessionData = await fs.readJSON(sessionPath);
            return {
              id: sessionId,
              created: new Date(sessionData.created),
              lastModified: new Date(sessionData.lastModified),
              messageCount: sessionData.messages?.length || 0
            };
          } catch (error) {
            log('Failed to read session file:', file, error);
            return null;
          }
        })
      );
      
      return sessions
        .filter(session => session !== null)
        .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
        
    } catch (error) {
      log('Failed to list sessions:', error);
      throw new Error(`Cannot list sessions: ${error.message}`);
    }
  }

  async getLastSessionId(): Promise<string | null> {
    try {
      const sessions = await this.listSessions();
      return sessions.length > 0 ? sessions[0].id : null;
    } catch (error) {
      log('Failed to get last session:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
    
    try {
      await fs.remove(sessionPath);
      log('Deleted session:', sessionId);
    } catch (error) {
      log('Failed to delete session:', sessionId, error);
      throw new Error(`Cannot delete session: ${error.message}`);
    }
  }

  async exportSession(sessionId: string, format: 'json' | 'md' = 'json'): Promise<string> {
    try {
      const session = await this.resumeSession(sessionId);
      
      if (format === 'json') {
        return JSON.stringify(session, null, 2);
      } else if (format === 'md') {
        return this.convertToMarkdown(session);
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      log('Failed to export session:', sessionId, error);
      throw new Error(`Cannot export session: ${error.message}`);
    }
  }

  private convertToMarkdown(session: Session): string {
    let markdown = `# Session ${session.id}\n\n`;
    markdown += `**Created:** ${session.created.toISOString()}\n`;
    markdown += `**Last Modified:** ${session.lastModified.toISOString()}\n`;
    markdown += `**Mode:** ${session.metadata.mode}\n`;
    if (session.metadata.tenant) {
      markdown += `**Tenant:** ${session.metadata.tenant}\n`;
    }
    markdown += `**Total Messages:** ${session.metadata.totalMessages}\n\n`;
    
    markdown += `## Conversation\n\n`;
    
    session.messages.forEach((message, index) => {
      markdown += `### ${message.role === 'user' ? 'User' : 'Assistant'} (${message.timestamp.toLocaleString()})\n\n`;
      markdown += `${message.content}\n\n`;
      
      if (message.executionPlan) {
        markdown += `<details>\n<summary>Execution Details</summary>\n\n`;
        markdown += `- **Mode:** ${message.executionPlan.mode}\n`;
        markdown += `- **Agent:** ${message.executionPlan.agent}\n`;
        if (message.executionPlan.model) {
          markdown += `- **Model:** ${message.executionPlan.model}\n`;
        }
        if (message.executionPlan.pipeline) {
          markdown += `- **Pipeline:** ${message.executionPlan.pipeline}\n`;
        }
        markdown += `- **Routing Reason:** ${message.executionPlan.routing.reason}\n`;
        markdown += `</details>\n\n`;
      }
    });
    
    return markdown;
  }

  async getSessionStats(): Promise<{
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    oldestSession: Date | null;
    newestSession: Date | null;
  }> {
    try {
      const sessions = await this.listSessions();
      
      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          totalMessages: 0,
          averageMessagesPerSession: 0,
          oldestSession: null,
          newestSession: null
        };
      }
      
      const totalMessages = sessions.reduce((sum, session) => sum + session.messageCount, 0);
      const averageMessagesPerSession = totalMessages / sessions.length;
      const oldestSession = sessions[sessions.length - 1].created;
      const newestSession = sessions[0].created;
      
      return {
        totalSessions: sessions.length,
        totalMessages,
        averageMessagesPerSession: Math.round(averageMessagesPerSession * 100) / 100,
        oldestSession,
        newestSession
      };
    } catch (error) {
      log('Failed to get session stats:', error);
      throw new Error(`Cannot get session statistics: ${error.message}`);
    }
  }

  async cleanupOldSessions(maxAge: number = 30): Promise<number> {
    try {
      const sessions = await this.listSessions();
      const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);
      
      let deletedCount = 0;
      
      for (const session of sessions) {
        if (session.lastModified < cutoffDate) {
          await this.deleteSession(session.id);
          deletedCount++;
        }
      }
      
      log(`Cleaned up ${deletedCount} old sessions`);
      return deletedCount;
    } catch (error) {
      log('Failed to cleanup old sessions:', error);
      throw new Error(`Cannot cleanup sessions: ${error.message}`);
    }
  }
}