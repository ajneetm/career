import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function InstructorsAdmin() {
  // 1. جلب قائمة المدربين من سوبابيس
  const instructors = await prisma.instructor.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // 2. وظيفة إضافة مدرب جديد (Server Action)
  async function addInstructor(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await prisma.instructor.create({
        data: {
          name,
          email,
          password, // ملاحظة: في المشروع الحقيقي سنقوم بتشفيرها
          agreementSigned: true,
        },
      });
      revalidatePath('/admin/instructors');
    } catch (error) {
      console.error("خطأ في الإضافة:", error);
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', direction: 'rtl', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        <h1 style={{ color: '#2d3748', borderBottom: '2px solid #edf2f7', paddingBottom: '10px' }}>🎓 إدارة المدربين - Career For Everyone</h1>
        
        {/* نموذج الإضافة */}
        <section style={{ margin: '30px 0', padding: '20px', backgroundColor: '#ebf8ff', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>إضافة مدرب جديد</h3>
          <form action={addInstructor} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <input name="name" placeholder="الاسم الكامل" required style={{ flex: '1', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e0' }} />
            <input name="email" type="email" placeholder="البريد الإلكتروني" required style={{ flex: '1', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e0' }} />
            <input name="password" type="password" placeholder="كلمة المرور" required style={{ flex: '1', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e0' }} />
            <button type="submit" style={{ backgroundColor: '#4299e1', color: 'white', padding: '10px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ المدرب</button>
          </form>
        </section>

        {/* جدول العرض */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#edf2f7', textAlign: 'right' }}>
              <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>الاسم</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>الإيميل</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {instructors.length > 0 ? (
              instructors.map((inst) => (
                <tr key={inst.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '15px' }}>{inst.name}</td>
                  <td style={{ padding: '15px' }}>{inst.email}</td>
                  <td style={{ padding: '15px', color: '#718096', fontSize: '0.9em' }}>
                    {new Date(inst.createdAt).toLocaleDateString('ar-QA')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#a0aec0' }}>لا يوجد مدربين مسجلين بعد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}