import { activeAgents } from '../config/agents.js';

export class PulseMonitor {
  constructor(interval = 5000) {
    this.agents = activeAgents;
    this.interval = interval;
    this.heartbeats = new Map();
  }

  start() {
    setInterval(() => this.checkAgents(), this.interval);
  }

  async checkAgents() {
    for (const [agentId, config] of Object.entries(this.agents)) {
      if (config.enabled) {
        const health = await this.pingAgent(agentId);
        this.heartbeats.set(agentId, {
          timestamp: Date.now(),
          status: health.ok ? 'alive' : 'down',
          latency: health.latency
        });
      }
    }
  }

  async pingAgent(agentId) {
    const start = Date.now();
    try {
      const res = await fetch(`/api/agents/${agentId}/health`);
      return {
        ok: res.ok,
        latency: Date.now() - start
      };
    } catch {
      return { ok: false, latency: -1 };
    }
  }

  getStatus() {
    return Object.fromEntries(this.heartbeats);
  }
} 