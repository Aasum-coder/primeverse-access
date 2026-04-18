/**
 * One-time backfill: regenerate bio_translations for distributors
 * whose bio is set but whose bio_translations is null or empty.
 *
 * Requires the following environment variables (from .env.local or shell):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   GROQ_API_KEY
 *
 * The script auto-loads .env.local then .env from the current working
 * directory (values already in process.env win).
 *
 * Run:
 *   npx tsx scripts/backfill-bio-translations.ts
 *
 * Flags:
 *   --dry-run     : print what would change without writing
 *   --slug=foo    : only process a single distributor
 *   --limit=N     : process at most N distributors
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { translateBio } from '../lib/bio-translator'

function loadDotenv(file: string) {
  const full = path.resolve(process.cwd(), file)
  if (!fs.existsSync(full)) return
  const raw = fs.readFileSync(full, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadDotenv('.env.local')
loadDotenv('.env')

interface Args {
  dryRun: boolean
  slug: string | null
  limit: number | null
}

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false, slug: null, limit: null }
  for (const a of argv.slice(2)) {
    if (a === '--dry-run') args.dryRun = true
    else if (a.startsWith('--slug=')) args.slug = a.slice('--slug='.length).trim() || null
    else if (a.startsWith('--limit=')) {
      const n = Number(a.slice('--limit='.length))
      if (Number.isFinite(n) && n > 0) args.limit = Math.floor(n)
    }
  }
  return args
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const args = parseArgs(process.argv)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const groqKey = process.env.GROQ_API_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
    process.exit(1)
  }
  if (!groqKey) {
    console.error('Missing GROQ_API_KEY in environment')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  let query = supabase
    .from('distributors')
    .select('id, slug, name, bio, bio_translations')
    .not('bio', 'is', null)
    .neq('bio', '')

  if (args.slug) query = query.eq('slug', args.slug)

  const { data: rows, error } = await query
  if (error) {
    console.error('Failed to fetch distributors:', error.message)
    process.exit(1)
  }

  const candidates = (rows || []).filter(d => {
    if (!d.bio || !String(d.bio).trim()) return false
    const t = d.bio_translations
    if (!t) return true
    if (typeof t === 'object' && t !== null && Object.keys(t as Record<string, unknown>).length === 0) return true
    return false
  })

  const pool = args.limit ? candidates.slice(0, args.limit) : candidates

  console.log(`Found ${candidates.length} distributor(s) needing translations${args.limit ? ` (processing first ${pool.length})` : ''}${args.dryRun ? ' — DRY RUN' : ''}`)
  if (pool.length === 0) {
    console.log('Nothing to do.')
    return
  }

  let success = 0
  let failed = 0

  for (let i = 0; i < pool.length; i++) {
    const d = pool[i]
    const label = `[${i + 1}/${pool.length}] ${d.slug || d.id}`

    try {
      if (args.dryRun) {
        console.log(`${label}: would translate (bio ${String(d.bio).length} chars)`)
        success++
        continue
      }

      const { bios } = await translateBio({ bio: String(d.bio), fullName: d.name || null })

      const { error: updateErr } = await supabase
        .from('distributors')
        .update({ bio_translations: bios })
        .eq('id', d.id)

      if (updateErr) {
        console.error(`${label}: update failed — ${updateErr.message}`)
        failed++
      } else {
        console.log(`${label}: Updated ${d.slug || d.id}: 9 languages`)
        success++
      }
    } catch (err) {
      console.error(`${label}: error — ${(err as Error).message}`)
      failed++
    }

    // Rate-limit pacing (skip delay on the last iteration)
    if (!args.dryRun && i < pool.length - 1) {
      await sleep(1000)
    }
  }

  console.log('')
  console.log(`Processed ${pool.length} distributor(s). ${success} succeeded. ${failed} failed.`)
}

main().catch(err => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
