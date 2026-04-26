#!/usr/bin/env tsx
/**
 * Sync Notion guide → styled PDF → public/downloads/
 *
 * Pulls the "PrimeVerse Auto-Approval Setup" Notion page via the official API,
 * converts blocks to Markdown, wraps with SYSTM8 brand CSS, and renders to a
 * PDF that the dashboard's Instructions panel serves at
 *   https://www.primeverseaccess.com/downloads/primeverse-auto-approval-setup.pdf
 *
 * Designed to run from CI (.github/workflows/sync-notion-pdf.yml) or locally.
 *
 * Env:
 *   NOTION_API_KEY   — required. Internal-integration secret with read access
 *                      to the page below.
 *   NOTION_PAGE_ID   — optional override (default: 34be6af8-3e5a-80cc-9653-c0611f47f27a).
 *
 * Exits with a non-zero status if the rendered PDF is implausibly small or
 * empty so a CI run never silently overwrites a real PDF with junk.
 */

import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { mdToPdf } from 'md-to-pdf'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

const DEFAULT_PAGE_ID = '34be6af8-3e5a-80cc-9653-c0611f47f27a'
const OUT_PATH = path.join('public', 'downloads', 'primeverse-auto-approval-setup.pdf')
const MIN_PDF_BYTES = 50 * 1024 // placeholder is ~744 B; a real export is much bigger

function fail(msg: string): never {
  console.error(`[sync-notion-pdf] ${msg}`)
  process.exit(1)
}

async function main() {
  const token = process.env.NOTION_API_KEY
  if (!token) fail('NOTION_API_KEY is not set. Add it to the env (CI: GitHub Secrets).')

  const pageId = process.env.NOTION_PAGE_ID || DEFAULT_PAGE_ID
  console.log(`[sync-notion-pdf] Fetching page ${pageId}…`)

  const notion = new Client({ auth: token })
  const n2m = new NotionToMarkdown({ notionClient: notion })

  let markdown = ''
  try {
    const blocks = await n2m.pageToMarkdown(pageId)
    markdown = n2m.toMarkdownString(blocks).parent || ''
  } catch (err: any) {
    fail(
      `Notion fetch failed: ${err?.message || err}\n` +
        `Hint: make sure the integration has been shared with the page ` +
        `(Notion → Share → Add connections → select your integration).`
    )
  }

  if (!markdown.trim()) fail('Notion returned an empty page — check the page ID and integration access.')
  console.log(`[sync-notion-pdf] Markdown rendered (${markdown.length} chars)`)

  // SYSTM8 brand styling — same palette used across the dashboard and emails.
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
    body { background: #080808; color: #f0ede8; font-family: 'DM Sans', Arial, sans-serif; line-height: 1.65; padding: 32px 40px; font-size: 12pt; }
    h1, h2, h3, h4 { font-family: 'Cormorant Garamond', Georgia, serif; color: #c9a84c; margin: 1.4em 0 0.5em; line-height: 1.2; }
    h1 { font-size: 24pt; letter-spacing: 0.02em; border-bottom: 1px solid rgba(201,168,76,0.25); padding-bottom: 8px; }
    h2 { font-size: 18pt; }
    h3 { font-size: 14pt; }
    p, li { color: #f0ede8; }
    a { color: #c9a84c; text-decoration: underline; }
    strong { color: #ffffff; }
    em { color: #dfc278; }
    code { background: rgba(201,168,76,0.10); color: #c9a84c; padding: 1px 6px; border-radius: 4px; font-size: 0.92em; }
    pre { background: rgba(0,0,0,0.4); color: #f0ede8; padding: 14px 16px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2); overflow-x: auto; }
    blockquote { border-left: 3px solid #c9a84c; margin: 1em 0; padding: 4px 16px; color: #dfc278; background: rgba(201,168,76,0.04); }
    ul, ol { padding-left: 1.5em; }
    li { margin: 0.3em 0; }
    img { max-width: 100%; border-radius: 8px; }
    hr { border: none; border-top: 1px solid rgba(201,168,76,0.25); margin: 2em 0; }
  `

  const header = '# PrimeVerse Auto-Approval Setup\n\n_Auto-generated from Notion — do not edit by hand._\n\n---\n\n'
  const fullMarkdown = header + markdown

  console.log('[sync-notion-pdf] Rendering to PDF…')
  const result = await mdToPdf(
    { content: fullMarkdown },
    {
      css,
      pdf_options: {
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        printBackground: true,
      },
      // Don't write to disk via mdToPdf; we manage the path ourselves so we
      // can validate before overwriting the existing artifact.
      dest: '',
    }
  )

  if (!result || !result.content) fail('mdToPdf returned no content')
  const bytes = Buffer.byteLength(result.content)
  console.log(`[sync-notion-pdf] PDF rendered (${bytes} bytes)`)

  if (bytes < MIN_PDF_BYTES) {
    fail(`PDF too small (${bytes} B < ${MIN_PDF_BYTES} B). Refusing to overwrite the existing file.`)
  }

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true })
  await fs.writeFile(OUT_PATH, result.content)
  console.log(`[sync-notion-pdf] Wrote ${OUT_PATH}`)
}

main().catch(err => {
  console.error('[sync-notion-pdf] Unexpected error:', err)
  process.exit(1)
})
