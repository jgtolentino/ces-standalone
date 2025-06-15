import { promptProfiles } from '../config/agents.js'
import fs from 'fs'
import path from 'path'

export function preProcess(task) {
  // Context-aware task routing
  if (task.context?.creative) {
    return { routeTo: 'yummy', priority: 9 };
  }
  if (task.context?.data_heavy) {
    return { routeTo: 'cesAI', priority: 7 };
  }
  return { routeTo: 'self', priority: 5 };
}

export async function preloadAgentContext(agentConfig) {
  let profile = process.env.PROMPT_PROFILE || promptProfiles.default
  let profilePath = promptProfiles.options[profile] || promptProfiles.options.claude

  try {
    const promptText = fs.readFileSync(path.resolve(__dirname, '..', profilePath), 'utf8')
    agentConfig.systemPrompt = promptText
    console.log(`✅ Loaded system prompt from profile: ${profile}`)
  } catch (err) {
    console.warn(`⚠️ Failed to load system prompt for ${profile}, falling back.`)
    agentConfig.systemPrompt = 'You are a helpful AI.'
  }

  return agentConfig
} 