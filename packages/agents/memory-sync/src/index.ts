import { createClient } from '@ai/db';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';

export interface AgentMemory {
  id: string;
  agent_id: string;
  session_id: string;
  memory_type: 'conversation' | 'context' | 'knowledge' | 'preference' | 'state';
  content: any;
  metadata: {
    importance: number; // 1-10
    access_count: number;
    last_accessed: string;
    expires_at?: string;
    tags: string[];
  };
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface AgentMessage {
  id: string;
  session_id: string;
  agent_id: string;
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  metadata?: {
    function_name?: string;
    function_args?: any;
    function_result?: any;
    model?: string;
    tokens?: number;
    cost?: number;
  };
  tenant_id: string;
  created_at: string;
}

export interface CrossAgentMessage {
  id: string;
  from_agent: string;
  to_agent: string;
  message_type: 'request' | 'response' | 'notification' | 'data_share';
  payload: any;
  status: 'pending' | 'delivered' | 'processed' | 'failed';
  tenant_id: string;
  created_at: string;
  processed_at?: string;
}

export class MemorySync {
  private supabase: ReturnType<typeof createClient>;
  private tenantId: string;

  constructor(tenantId: string = 'org-wide') {
    this.tenantId = tenantId;
    this.supabase = createClient();
  }

  /**
   * Store agent memory
   */
  async storeMemory(memory: Omit<AgentMemory, 'id' | 'created_at' | 'updated_at'>): Promise<AgentMemory> {
    const memoryRecord: AgentMemory = {
      ...memory,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('agent_memory')
      .insert(memoryRecord)
      .select()
      .single();

    if (error) {
      console.error('❌ Error storing memory:', error);
      throw error;
    }

    console.log(`💾 Stored memory for agent ${memory.agent_id}: ${memory.memory_type}`);
    return data;
  }

  /**
   * Retrieve agent memory
   */
  async getMemory(
    agentId: string,
    memoryType?: AgentMemory['memory_type'],
    sessionId?: string
  ): Promise<AgentMemory[]> {
    let query = this.supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_id', agentId)
      .eq('tenant_id', this.tenantId);

    if (memoryType) {
      query = query.eq('memory_type', memoryType);
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error retrieving memory:', error);
      throw error;
    }

    // Update access count and last accessed
    if (data && data.length > 0) {
      const memoryIds = data.map(m => m.id);
      await this.updateMemoryAccess(memoryIds);
    }

    return data || [];
  }

  /**
   * Update memory content
   */
  async updateMemory(memoryId: string, updates: Partial<AgentMemory>): Promise<AgentMemory> {
    const { data, error } = await this.supabase
      .from('agent_memory')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memoryId)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating memory:', error);
      throw error;
    }

    return data;
  }

  /**
   * Store agent message
   */
  async storeMessage(message: Omit<AgentMessage, 'id' | 'created_at'>): Promise<AgentMessage> {
    const messageRecord: AgentMessage = {
      ...message,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('agent_message')
      .insert(messageRecord)
      .select()
      .single();

    if (error) {
      console.error('❌ Error storing message:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(
    sessionId: string,
    limit: number = 50
  ): Promise<AgentMessage[]> {
    const { data, error } = await this.supabase
      .from('agent_message')
      .select('*')
      .eq('session_id', sessionId)
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('❌ Error retrieving conversation:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Send message between agents
   */
  async sendCrossAgentMessage(
    fromAgent: string,
    toAgent: string,
    messageType: CrossAgentMessage['message_type'],
    payload: any
  ): Promise<CrossAgentMessage> {
    const message: CrossAgentMessage = {
      id: uuidv4(),
      from_agent: fromAgent,
      to_agent: toAgent,
      message_type: messageType,
      payload,
      status: 'pending',
      tenant_id: this.tenantId,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('cross_agent_messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error('❌ Error sending cross-agent message:', error);
      throw error;
    }

    console.log(`📤 Message sent from ${fromAgent} to ${toAgent}: ${messageType}`);
    return data;
  }

  /**
   * Get pending messages for an agent
   */
  async getPendingMessages(agentId: string): Promise<CrossAgentMessage[]> {
    const { data, error } = await this.supabase
      .from('cross_agent_messages')
      .select('*')
      .eq('to_agent', agentId)
      .eq('tenant_id', this.tenantId)
      .in('status', ['pending', 'delivered'])
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error retrieving pending messages:', error);
      throw error;
    }

    // Mark messages as delivered
    if (data && data.length > 0) {
      const messageIds = data.map(m => m.id);
      await this.markMessagesDelivered(messageIds);
    }

    return data || [];
  }

  /**
   * Mark cross-agent message as processed
   */
  async markMessageProcessed(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cross_agent_messages')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('tenant_id', this.tenantId);

    if (error) {
      console.error('❌ Error marking message as processed:', error);
      throw error;
    }
  }

  /**
   * Create or get session for agent
   */
  async createSession(agentId: string, userId?: string): Promise<string> {
    const sessionId = uuidv4();
    
    // Store session metadata
    await this.storeMemory({
      agent_id: agentId,
      session_id: sessionId,
      memory_type: 'state',
      content: {
        session_start: new Date().toISOString(),
        user_id: userId,
        status: 'active',
      },
      metadata: {
        importance: 5,
        access_count: 0,
        last_accessed: new Date().toISOString(),
        tags: ['session', 'active'],
      },
      tenant_id: this.tenantId,
    });

    console.log(`🆔 Created session ${sessionId} for agent ${agentId}`);
    return sessionId;
  }

  /**
   * End session and archive memories
   */
  async endSession(sessionId: string): Promise<void> {
    // Update session status
    const { error: memoryError } = await this.supabase
      .from('agent_memory')
      .update({
        content: this.supabase.rpc('jsonb_set', {
          target: 'content',
          path: '{status}',
          new_value: '"ended"'
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('memory_type', 'state')
      .eq('tenant_id', this.tenantId);

    if (memoryError) {
      console.error('❌ Error ending session:', memoryError);
      throw memoryError;
    }

    console.log(`🏁 Ended session ${sessionId}`);
  }

  /**
   * Clean up expired memories
   */
  async cleanupExpiredMemories(): Promise<number> {
    console.log('🧹 Cleaning up expired memories...');

    // Delete memories that have expired
    const { data, error } = await this.supabase
      .from('agent_memory')
      .delete()
      .eq('tenant_id', this.tenantId)
      .lt('metadata->expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      console.error('❌ Error cleaning up memories:', error);
      throw error;
    }

    const deletedCount = data?.length || 0;
    console.log(`🗑️ Cleaned up ${deletedCount} expired memories`);
    
    return deletedCount;
  }

  /**
   * Archive old conversations
   */
  async archiveOldConversations(olderThanDays: number = 30): Promise<number> {
    console.log(`📦 Archiving conversations older than ${olderThanDays} days...`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Move old messages to archive table
    const { data, error } = await this.supabase.rpc('archive_old_messages', {
      cutoff_date: cutoffDate.toISOString(),
      tenant_filter: this.tenantId,
    });

    if (error) {
      console.error('❌ Error archiving conversations:', error);
      throw error;
    }

    const archivedCount = data || 0;
    console.log(`📦 Archived ${archivedCount} old messages`);
    
    return archivedCount;
  }

  /**
   * Get memory usage statistics
   */
  async getMemoryStats(): Promise<{
    total_memories: number;
    memories_by_type: Record<string, number>;
    total_messages: number;
    active_sessions: number;
    storage_usage_mb: number;
  }> {
    const [memoriesResult, messagesResult, sessionsResult] = await Promise.all([
      this.supabase
        .from('agent_memory')
        .select('memory_type')
        .eq('tenant_id', this.tenantId),
      
      this.supabase
        .from('agent_message')
        .select('id', { count: 'exact' })
        .eq('tenant_id', this.tenantId),
      
      this.supabase
        .from('agent_memory')
        .select('session_id')
        .eq('tenant_id', this.tenantId)
        .eq('memory_type', 'state')
        .contains('content', { status: 'active' })
    ]);

    const memories = memoriesResult.data || [];
    const memoriesByType = memories.reduce((acc, m) => {
      acc[m.memory_type] = (acc[m.memory_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Estimate storage usage (rough calculation)
    const storageUsageMB = (memories.length * 0.5) + ((messagesResult.count || 0) * 0.1);

    return {
      total_memories: memories.length,
      memories_by_type: memoriesByType,
      total_messages: messagesResult.count || 0,
      active_sessions: sessionsResult.data?.length || 0,
      storage_usage_mb: Math.round(storageUsageMB * 100) / 100,
    };
  }

  /**
   * Start scheduled cleanup
   */
  startScheduledCleanup(schedule: string = '0 2 * * *'): void {
    console.log(`⏰ Starting scheduled memory cleanup (${schedule}) for tenant: ${this.tenantId}`);
    
    cron.schedule(schedule, async () => {
      try {
        await this.cleanupExpiredMemories();
        await this.archiveOldConversations();
        
        const stats = await this.getMemoryStats();
        console.log(`📊 Memory stats: ${JSON.stringify(stats, null, 2)}`);
      } catch (error) {
        console.error('❌ Scheduled cleanup failed:', error);
      }
    });
  }

  /**
   * Helper: Update memory access tracking
   */
  private async updateMemoryAccess(memoryIds: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('agent_memory')
      .update({
        metadata: this.supabase.rpc('jsonb_set', {
          target: 'metadata',
          path: '{access_count}',
          new_value: '(metadata->\'access_count\')::int + 1'
        }),
        updated_at: new Date().toISOString(),
      })
      .in('id', memoryIds);

    if (error) {
      console.error('❌ Error updating memory access:', error);
    }
  }

  /**
   * Helper: Mark messages as delivered
   */
  private async markMessagesDelivered(messageIds: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('cross_agent_messages')
      .update({ status: 'delivered' })
      .in('id', messageIds);

    if (error) {
      console.error('❌ Error marking messages as delivered:', error);
    }
  }
}

// Export factory function
export function createMemorySync(tenantId: string = 'org-wide') {
  return new MemorySync(tenantId);
}

// CLI interface
if (require.main === module) {
  const memorySync = new MemorySync();
  
  if (process.argv.includes('--cleanup')) {
    memorySync.cleanupExpiredMemories().catch(console.error);
  } else if (process.argv.includes('--stats')) {
    memorySync.getMemoryStats().then(console.log).catch(console.error);
  } else if (process.argv.includes('--schedule')) {
    memorySync.startScheduledCleanup();
  }
}