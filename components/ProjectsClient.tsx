'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type Project = {
  id: string
  title: string
  description: string | null
  is_active: boolean
  created_at: string
}

export function ProjectsClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: auth }) => {
      if (!auth.user) { router.push('/login'); return }
      setUser(auth.user)

      const res = await fetch(`/api/projects?owner_id=${auth.user.id}`)
      const data = await res.json()
      setProject(data ?? null)
      setLoading(false)
    })
  }, [router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSending(true)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_id: user.id,
        owner_name: user.user_metadata?.name ?? user.email,
        title,
        description,
      }),
    })
    const data = await res.json()
    setSending(false)
    if (data.id) {
      setSent(true)
      setProject({ id: data.id, title, description, is_active: false, created_at: new Date().toISOString() })
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div dir="rtl" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/user" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>← الداشبورد</Link>
      </div>

      <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>مشاريع الورشة</h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 28 }}>سجّل مشروعك وانتظر موافقة الإدارة</p>

      {project ? (
        <div>
          <div className="assessment-card" style={{ padding: '24px 20px', marginBottom: 16,
            borderRight: `4px solid ${project.is_active ? '#16a34a' : '#f59e0b'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{project.title}</h2>
                {project.description && (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{project.description}</p>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: 99, flexShrink: 0,
                background: project.is_active ? '#dcfce7' : '#fef3c7',
                color: project.is_active ? '#16a34a' : '#92400e', fontWeight: 600 }}>
                {project.is_active ? 'جاهز للتقييم ✓' : 'بانتظار موافقة الإدارة ⏳'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 12 }}>
              {new Date(project.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {project.is_active && (
            <div className="assessment-card" style={{ padding: '16px 20px', background: '#f0fdf4', borderColor: '#86efac' }}>
              <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0 }}>
                🎉 مشروعك نشط! شارك رابط التقييم مع المشاركين الآخرين عبر QR code الخاص بالإدارة.
              </p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="assessment-card" style={{ padding: '24px 20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>تسجيل مشروع جديد</h3>
            <div className="form-field" style={{ marginBottom: 14 }}>
              <label>اسم المشروع *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="اسم مشروعك" required />
            </div>
            <div className="form-field" style={{ marginBottom: 20 }}>
              <label>وصف المشروع (اختياري)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="وصف مختصر لفكرة مشروعك..."
                style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 14px',
                  fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            </div>
            {sent && <p style={{ color: '#16a34a', fontSize: '0.85rem', marginBottom: 12 }}>تم الإرسال! ⏳ بانتظار موافقة الإدارة</p>}
            <button className="btn-primary" type="submit" disabled={sending}>
              {sending ? 'جارِ الإرسال...' : 'إرسال المشروع'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
