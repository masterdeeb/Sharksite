'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  // In a real app, use a secure comparison and environment variable
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123'

  if (password === validPassword) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
    return { success: true }
  } else {
    return { success: false, error: 'كلمة المرور غير صحيحة' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/')
}
