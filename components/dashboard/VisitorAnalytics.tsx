'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCountryName } from '@/lib/analytics/country-codes'

interface VisitorAnalyticsData {
  totalVisits: number
  uniqueCountries: number
  topCountries: Array<{ country: string; count: number }>
  timeSeries: Array<{ date: string; count: number }>
  perIB: Array<{ slug: string; visits: number; topCountry: string }> | null
  scope: 'admin' | 'ib'
}

const GOLD = '#c9a84c'
const GOLD_DIM = 'rgba(201,168,76,0.5)'
const TEXT_DIM = '#888'
const BORDER = 'rgba(201,168,76,0.18)'

export default function VisitorAnalytics() {
  const [data, setData] = useState<VisitorAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/admin/analytics/visitors', {
          headers: {
            ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
          },
        })
        const body = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok || body?.error) {
          setError(body?.error?.message || `HTTP ${res.status}`)
          setLoading(false)
          return
        }
        setData(body.data as VisitorAnalyticsData)
        setLoading(false)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
          setLoading(false)
        }
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <div style={{ padding: '2rem', color: TEXT_DIM, fontSize: '0.9rem' }}>Laster…</div>
  }
  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#ef4444', fontSize: '0.9rem' }}>
        Kunne ikke laste besøksstatistikk: {error}
      </div>
    )
  }
  if (!data) return null

  const noData = data.totalVisits === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <StatCard label="Totalt besøk (90 dager)" value={data.totalVisits.toLocaleString('nb-NO')} />
        <StatCard label="Unike land" value={data.uniqueCountries.toString()} />
      </div>

      {/* Top countries */}
      <Section title="Topp 10 land">
        {data.topCountries.length === 0 ? (
          <p style={{ color: TEXT_DIM, fontSize: '0.85rem', margin: 0 }}>Ingen besøk ennå.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.topCountries.map(({ country, count }) => (
              <li
                key={country}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${BORDER}`,
                  padding: '0.5rem 0',
                  fontSize: '0.88rem',
                }}
              >
                <span style={{ color: '#f0ede8' }}>
                  {getCountryName(country)} <span style={{ color: TEXT_DIM, fontSize: '0.78rem' }}>({country})</span>
                </span>
                <span style={{ color: GOLD, fontWeight: 600 }}>{count.toLocaleString('nb-NO')}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Per-IB (admin only) */}
      {data.scope === 'admin' && data.perIB && (
        <Section title="Per IB">
          {data.perIB.length === 0 ? (
            <p style={{ color: TEXT_DIM, fontSize: '0.85rem', margin: 0 }}>Ingen IB-aktivitet ennå.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, color: TEXT_DIM }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: 600 }}>IB</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0', fontWeight: 600 }}>Besøk</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0', fontWeight: 600 }}>Topp land</th>
                </tr>
              </thead>
              <tbody>
                {data.perIB.map(({ slug, visits, topCountry }) => (
                  <tr key={slug} style={{ borderBottom: `1px solid rgba(201,168,76,0.08)` }}>
                    <td style={{ padding: '0.5rem 0', color: '#f0ede8' }}>{slug}</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right', color: GOLD, fontWeight: 600 }}>
                      {visits.toLocaleString('nb-NO')}
                    </td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right', color: TEXT_DIM }}>
                      {getCountryName(topCountry)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}

      {/* Time series — last 30 days */}
      <Section title="Besøk siste 30 dager">
        {noData ? (
          <p style={{ color: TEXT_DIM, fontSize: '0.85rem', margin: 0 }}>Ingen besøk ennå.</p>
        ) : (
          <SimpleBarChart data={data.timeSeries} />
        )}
      </Section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        padding: '1.25rem',
        background: 'rgba(201,168,76,0.03)',
      }}
    >
      <div style={{ fontSize: '0.78rem', color: TEXT_DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: GOLD }}>{value}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        padding: '1.25rem',
        background: 'rgba(201,168,76,0.03)',
      }}
    >
      <div
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: GOLD,
          marginBottom: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function SimpleBarChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 140, marginTop: 8 }}>
      {data.map(({ date, count }) => {
        const heightPct = (count / max) * 100
        return (
          <div
            key={date}
            title={`${date}: ${count.toLocaleString('nb-NO')} besøk`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: '100%',
                height: count > 0 ? `${Math.max(heightPct, 4)}%` : '0%',
                background: count > 0 ? GOLD : GOLD_DIM,
                borderRadius: '2px 2px 0 0',
                transition: 'background 0.2s',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
