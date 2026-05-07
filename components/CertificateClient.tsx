'use client'

import { useSearchParams } from 'next/navigation'

export function CertificateClient() {
  const params   = useSearchParams()
  const name     = params.get('name')     ?? ''
  const workshop = params.get('workshop') ?? ''
  const date     = params.get('date')     ?? new Date().toLocaleDateString('ar-SA')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Tajawal', sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .cert { width: 900px; min-height: 620px; background: white; position: relative; overflow: hidden; }
        .print-btn { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: #1e5fdc; color: white; border: none; border-radius: 12px; padding: 14px 40px; font-size: 1rem; font-weight: 700; font-family: 'Tajawal', sans-serif; cursor: pointer; box-shadow: 0 8px 24px rgba(30,95,220,0.35); z-index: 100; }
        @media print {
          body { background: white; }
          .print-btn { display: none; }
          .cert { width: 100%; box-shadow: none; }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>

      <div className="cert" dir="rtl">

        {/* Gold border frame */}
        <div style={{ position: 'absolute', inset: 16, border: '3px solid #b8972a', borderRadius: 4, pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 22, border: '1px solid #d4af5a', borderRadius: 2, pointerEvents: 'none', zIndex: 1 }} />

        {/* Corner ornaments */}
        {[
          { top: 10, right: 10 }, { top: 10, left: 10 },
          { bottom: 10, right: 10 }, { bottom: 10, left: 10 },
        ].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', width: 40, height: 40, ...pos, zIndex: 2,
            background: 'radial-gradient(circle, #d4af5a 0%, #b8972a 60%, transparent 70%)', borderRadius: '50%', opacity: 0.8 }} />
        ))}

        {/* Background watermark */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.04, fontSize: '18rem', fontWeight: 900, color: '#1e5fdc', userSelect: 'none', letterSpacing: -20 }}>C4E</div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 3, padding: '52px 72px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #1e5fdc, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.4rem', fontWeight: 900 }}>C4E</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Career For Everyone</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: 1 }}>CAREER DEVELOPMENT PLATFORM</div>
            </div>
          </div>

          {/* Title */}
          <div style={{ fontSize: '0.82rem', letterSpacing: 4, color: '#b8972a', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>CERTIFICATE OF COMPLETION</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: 28 }}>شهادة إتمام</div>

          {/* Body */}
          <div style={{ fontSize: '1rem', color: '#475569', marginBottom: 16, lineHeight: 2 }}>يُشهد بأن</div>

          {/* Name */}
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#1e5fdc', marginBottom: 4, borderBottom: '2px solid #b8972a', paddingBottom: 8, minWidth: 320 }}>
            {name || 'اسم المشارك'}
          </div>

          <div style={{ fontSize: '1rem', color: '#475569', marginTop: 20, marginBottom: 10, lineHeight: 2 }}>
            قد أتمّ بنجاح ورشة العمل
          </div>

          {/* Workshop name */}
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 28, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 32px' }}>
            {workshop || 'اسم الورشة'}
          </div>

          {/* Footer row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 140, borderTop: '1px solid #94a3b8', marginBottom: 6 }} />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>توقيع المدير</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 4 }}>تاريخ الإصدار</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{date}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 140, borderTop: '1px solid #94a3b8', marginBottom: 6 }} />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>توقيع المدرّب</div>
            </div>
          </div>
        </div>
      </div>

      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة / حفظ PDF</button>
    </>
  )
}
