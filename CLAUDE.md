## AUTO-MERGE RULE
After pushing changes to a feature branch, ALWAYS create a Pull Request and merge it immediately using the GitHub API. Do not leave PRs open for manual review. Use this pattern:
1. Push to feature branch
2. Create PR via GitHub API: gh pr create --title "..." --body "..."
3. Merge PR via GitHub API: gh pr merge --merge --auto
If gh CLI is not available, use curl with the GitHub API directly.

## REPO IDENTITY
This repo is Aasum-coder/primeverse-access (SYSTM8).
DO NOT confuse with Get-access-to-primverse or 1move-academy.
The production URL is www.primeverseaccess.com
The Vercel URL is primeverse-access.vercel.app
