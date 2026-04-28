import Anthropic from '@anthropic-ai/sdk'
import Groq from 'groq-sdk'

// Shared Anthropic + Groq clients for the My Voice API.
// Anthropic powers high-quality bio + system-prompt + translations.
// Groq powers fast/cheap builder suggestions.
//
// ANTHROPIC_API_KEY is already used elsewhere in the repo (ai-bio,
// ai-marketing); GROQ_API_KEY is established for ai-marketing too.
// Both should already be set in Vercel env.

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })
export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

// Latest Sonnet per the project's CLAUDE.md "default to latest" rule.
// Spec listed claude-sonnet-4-20250514 (older Sonnet 4) — using the
// current Sonnet 4.6 instead. See PR description for the deviation note.
export const CLAUDE_MODEL = 'claude-sonnet-4-6'

// Fast Groq model used for builder suggestions.
export const GROQ_MODEL = 'llama-3.3-70b-versatile'

interface ClaudeOpts {
  prompt: string
  maxTokens: number
  temperature?: number
  system?: string
}

export async function claudeMessage(opts: ClaudeOpts): Promise<string> {
  const params: Anthropic.Messages.MessageCreateParamsNonStreaming = {
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens,
    temperature: opts.temperature ?? 0.7,
    messages: [{ role: 'user', content: opts.prompt }],
  }
  if (opts.system) params.system = opts.system

  const response = await anthropic.messages.create(params)
  const block = response.content[0]
  return block && block.type === 'text' ? block.text : ''
}
