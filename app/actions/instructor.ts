'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createInstructor(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string // ملاحظة: سنقوم بتشفيرها لاحقاً

  try {
    const newInstructor = await prisma.instructor.create({
      data: {
        name,
        email,
        password,
        agreementSigned: true,
      },
    })
    
    revalidatePath('/instructors') // تحديث الصفحة لرؤية النتائج
    return { success: true, instructor: newInstructor }
  } catch (error) {
    return { success: false, error: "حدث خطأ أثناء التسجيل" }
  }
}