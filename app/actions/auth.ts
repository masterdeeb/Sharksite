'use server'

import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

const PASSWORD_FILE = path.join(process.cwd(), 'admin_password.txt')

function getAdminPassword() {
  try {
    if (fs.existsSync(PASSWORD_FILE)) {
      return fs.readFileSync(PASSWORD_FILE, 'utf-8').trim()
    }
  } catch (e) {}
  return 'admin123'
}

export async function login(password: string) {
  const currentPassword = getAdminPassword()
  if (password === currentPassword) {
    const cookieStore = await cookies()
    cookieStore.set('admin_auth', 'true', { 
      secure: true, 
      sameSite: 'none', 
      httpOnly: true, 
      path: '/' 
    })
    return { success: true }
  }
  return { success: false, error: 'Invalid password' }
}

export async function updatePassword(newPassword: string) {
  const isAuth = await checkAuth()
  if (!isAuth) return { success: false, error: 'Unauthorized' }
  
  try {
    fs.writeFileSync(PASSWORD_FILE, newPassword)
    return { success: true }
  } catch (e) {
    return { success: false, error: 'Failed to update password' }
  }
}

export async function checkAuth() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin_auth')
  return auth?.value === 'true'
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
}
