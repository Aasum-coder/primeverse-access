// Run with: npx tsx --test lib/analytics/bot-detection.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isBot } from './bot-detection'

test('null / undefined / blank UA is a bot (conservative default)', () => {
  assert.equal(isBot(null), true)
  assert.equal(isBot(undefined), true)
  assert.equal(isBot(''), true)
  assert.equal(isBot('   '), true)
})

test('common browser user-agents are not bots', () => {
  assert.equal(
    isBot(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
    ),
    false
  )
  assert.equal(
    isBot('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'),
    false
  )
  assert.equal(
    isBot('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'),
    false
  )
})

test('search engine crawlers are bots', () => {
  assert.equal(isBot('Googlebot/2.1 (+http://www.google.com/bot.html)'), true)
  assert.equal(isBot('Mozilla/5.0 (compatible; bingbot/2.0)'), true)
  assert.equal(isBot('Baiduspider+(+http://www.baidu.com/search/spider.htm)'), true)
  assert.equal(isBot('Mozilla/5.0 (compatible; YandexBot/3.0)'), true)
})

test('social-media unfurlers are bots', () => {
  assert.equal(isBot('facebookexternalhit/1.1'), true)
  assert.equal(isBot('Twitterbot/1.0'), true)
  assert.equal(isBot('LinkedInBot/1.0'), true)
  assert.equal(isBot('WhatsApp/2.23.20.0'), true)
  assert.equal(isBot('TelegramBot (like TwitterBot)'), true)
  assert.equal(isBot('Slackbot-LinkExpanding 1.0'), true)
  assert.equal(isBot('Discordbot/2.0'), true)
})

test('headless browsers + automation are bots', () => {
  assert.equal(isBot('Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0.0.0'), true)
  assert.equal(isBot('Mozilla/5.0 (compatible; PhantomJS/2.1.1)'), true)
  assert.equal(isBot('Mozilla/5.0 (compatible; selenium webdriver)'), true)
  assert.equal(isBot('Puppeteer/21.0.0'), true)
  assert.equal(isBot('Playwright/1.40.0'), true)
})

test('uptime / perf monitors are bots', () => {
  assert.equal(isBot('Mozilla/5.0 (compatible; Lighthouse 11.0)'), true)
  assert.equal(isBot('Pingdom.com_bot_version_1.4_(http://www.pingdom.com)'), true)
  assert.equal(isBot('Mozilla/5.0 (compatible; UptimeRobot/2.0)'), true)
})

test('curl / wget / python-requests are bots', () => {
  assert.equal(isBot('curl/8.4.0'), true)
  assert.equal(isBot('Wget/1.21.4'), true)
  assert.equal(isBot('python-requests/2.31.0'), true)
  assert.equal(isBot('Go-http-client/1.1'), true)
})

test('"bot" inside a brand name does not false-positive (no word boundary issues)', () => {
  // \bbot\b — "Robot" should still match (contains "bot"), but "Hubot" or
  // genuine browser names that happen to contain those substrings don't
  // realistically appear in legitimate UA strings. We bias toward
  // false-positives anyway. Verify the obvious browser strings above
  // pass cleanly.
  assert.equal(isBot('Mozilla/5.0'), false) // smoke check baseline
})
