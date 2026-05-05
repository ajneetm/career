'use client'

import { useEffect, useState } from 'react'

type Entry = { id: string; name: string; code: string; votes: number; avg: number }

const MEDALS = ['🥇', '🥈', '🥉']
const STARS  = (avg: number) => '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg))

export function StrangeResultsClient() {
  const [list, setList]       = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/strange/leaderboard')
      .then(r => r.json())
      .then(data => { setList(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={page}>
      <div className="spinner" />
    </div>
  )

  if (list.length === 0) return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: 12 }}>📭</div>
        <p style={{ textAlign: 'center', color: '#64748b' }}>لا توجد مهن للعرض بعد</p>
      </div>
    </div>
  )

  const winner = list[0]
  const maxAvg = winner.avg || 1

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f8fafc', padding: '28px 16px 60px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎭</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
            نتائج المهن الغريبة
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {list.length} مهنة · {list.reduce((s, e) => s + e.votes, 0)} صوت إجمالي
          </p>
        </div>

        {/* Winner hero */}
        {winner.votes > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #1e5fdc 0%, #6366f1 100%)', borderRadius: 24, padding: '28px 24px', marginBottom: 20, color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.7, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>الفائز</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>{winner.name}</div>
            <div style={{ fontSize: '1.1rem', letterSpacing: 4, marginBottom: 6, color: '#fbbf24' }}>
              {STARS(winner.avg)}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>
              متوسط {winner.avg.toFixed(1)} / 5 &nbsp;·&nbsp; {winner.votes} صوت
            </div>
          </div>
        )}

        {/* Rankings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((entry, idx) => {
            const pct = maxAvg > 0 ? (entry.avg / 5) * 100 : 0
            const isWinner = idx === 0 && entry.votes > 0
            return (
              <div key={entry.id} style={{
                background: 'white', borderRadius: 16, padding: '16px 20px',
                border: isWinner ? '2px solid #1e5fdc' : '1px solid #e2e8f0',
                boxShadow: isWinner ? '0 4px 16px rgba(30,95,220,0.12)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: entry.votes > 0 ? 10 : 0 }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                    {idx < 3 && entry.votes > 0 ? MEDALS[idx] : <span style={{ width: 28, display: 'inline-block', textAlign: 'center', fontWeight: 800, color: '#94a3b8', fontSize: '0.9rem' }}>{idx + 1}</span>}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{entry.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                      {entry.votes} صوت
                      {entry.votes > 0 && <span style={{ color: '#1e5fdc', fontWeight: 600 }}> · متوسط {entry.avg.toFixed(1)}/5</span>}
                    </div>
                  </div>
                  {entry.votes > 0 && (
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: isWinner ? '#1e5fdc' : '#374151' }}>
                        {entry.avg.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/ 5</div>
                    </div>
                  )}
                </div>

                {entry.votes > 0 && (
                  <div style={{ background: '#f1f5f9', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 99,
                      background: isWinner ? 'linear-gradient(90deg, #1e5fdc, #6366f1)' : '#94a3b8',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                )}

                {entry.votes === 0 && (
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: 4 }}>لا أصوات بعد</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Refresh */}
        <button onClick={() => { setLoading(true); fetch('/api/strange/leaderboard').then(r => r.json()).then(d => { setList(Array.isArray(d) ? d : []); setLoading(false) }) }}
          style={{ width: '100%', padding: '14px', marginTop: 20, background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 14, fontWeight: 600, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem' }}>
          🔄 تحديث النتائج
        </button>

      </div>
    </div>
  )
}

const page: React.CSSProperties = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }
const card: React.CSSProperties = { background: 'white', borderRadius: 24, padding: '32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: 480 }
