# Scripts

## `sync-notion-pdf.ts`

Pulls the **PrimeVerse Auto-Approval Setup** Notion page, applies SYSTM8 brand
styling, and writes the rendered PDF to
`public/downloads/primeverse-auto-approval-setup.pdf` — the file the dashboard's
**📖 Instructions → ⬇️ Download PDF** button serves at
`https://www.primeverseaccess.com/downloads/primeverse-auto-approval-setup.pdf`.

### One-time setup (≈90 seconds)

1. **Create a Notion internal integration** at
   <https://www.notion.so/profile/integrations> → "New internal integration".
   Name it `SYSTM8 PDF Sync`. Capabilities: read content. Copy the
   `ntn_…` secret.

2. **Share the page with the integration**:
   open the
   [PrimeVerse Auto-Approval Setup page](https://www.notion.so/PrimeVerse-Auto-Approval-Setup-34be6af83e5a80cc9653c0611f47f27a)
   → top-right `Share` → `Add connections` → select `SYSTM8 PDF Sync`.

3. **Add the secret to GitHub**:
   repo → Settings → Secrets and variables → Actions → `New repository secret`.
   Name: `NOTION_API_KEY`. Value: paste the `ntn_…` secret from step 1.

4. **Trigger the first run**:
   repo → Actions → `Sync Notion guide → PDF` → `Run workflow`.

After step 4 the workflow commits the regenerated PDF to `main` (or whatever
branch you ran it from). It also runs automatically every Monday at 06:00 UTC.

### Run locally (optional)

```bash
NOTION_API_KEY=ntn_xxx npx tsx scripts/sync-notion-pdf.ts
```

### Validation

The script refuses to overwrite the existing PDF when the rendered output is
smaller than 50 KB — guards against an accidental empty page or API hiccup.
