// Detects whether a request is from a bot based on its User-Agent string.
// Filters crawlers, social-media unfurlers, headless browsers, and uptime
// monitors so they don't pollute visitor analytics.
//
// Conservative by design: a missing/blank UA returns true. The cost of
// false-positives (counting one real visit as a bot) is far lower than
// the cost of false-negatives (a Googlebot crawl inflating the dashboard).

const BOT_PATTERNS: readonly RegExp[] = [
  // Generic markers
  /bot\b/i, /crawl/i, /spider/i, /scrape/i,
  // Search engines
  /googlebot/i, /bingbot/i, /baiduspider/i, /yandexbot/i, /duckduckbot/i,
  // Social-media unfurlers (LinkedIn / WhatsApp / Slack preview cards)
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /whatsapp/i, /telegrambot/i, /slackbot/i, /discordbot/i,
  // Headless browsers + automation
  /headless/i, /phantomjs/i, /selenium/i, /puppeteer/i, /playwright/i,
  // Performance / uptime monitors
  /lighthouse/i, /pagespeed/i, /uptimerobot/i, /pingdom/i, /statuscake/i,
  // Generic HTTP libraries (often automation)
  /\bcurl\//i, /wget/i, /python-requests/i, /go-http-client/i,
]

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent || !userAgent.trim()) return true
  return BOT_PATTERNS.some(re => re.test(userAgent))
}
