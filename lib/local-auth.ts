'use client'

import { useState, useEffect, useCallback } from 'react'
import { getKv, setKv, ensureLocalDbSeeded } from './local-db'

const ADMIN_CONFIG_KEY = 'admin_config'
const SESSION_STORAGE_KEY = 'sharksite_local_admin_session'
const DEFAULT_ADMIN_PASSWORD = 'admin123'
const AUTH_EVENT = 'sharksite_local_auth_change'

interface AdminConfig {
  password: string
  adminLabel: string
  updatedAt: number
}

interface AdminSession {
  authenticated: boolean
  label: string
  loggedInAt: number
}

async function getAdminConfig(): Promise<AdminConfig> {
  await ensureLocalDbSeeded()
  const stored = await getKv<AdminConfig>(ADMIN_CONFIG_KEY)
  if (stored && typeof stored.password === 'string' && stored.password.length > 0) {
    return stored
  }
  const initial: AdminConfig = {
    password: DEFAULT_ADMIN_PASSWORD,
    adminLabel: 'Local Admin',
    updatedAt: Date.now(),
  }
  await setKv(ADMIN_CONFIG_KEY, initial, 'admin_config')
  return initial
}

function readSession(): AdminSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminSession
    return parsed?.authenticated ? parsed : null
  } catch {
    return null
  }
}

function writeSession(session: AdminSession | null) {
  if (typeof window === 'undefined') return
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
    window.dispatchEvent(new Event(AUTH_EVENT))
  } catch {
    // Ignore storage errors
  }
}

export async function signInLocalAdmin(password: string): Promise<boolean> {
  const config = await getAdminConfig()
  if (password === config.password) {
    writeSession({
      authenticated: true,
      label: config.adminLabel || 'Local Admin',
      loggedInAt: Date.now(),
    })
    return true
  }
  return false
}

export async function signOutLocalAdmin(): Promise<void> {
  writeSession(null)
}

export async function updateLocalAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const trimmedNew = newPassword.trim()
  if (trimmedNew.length < 4) {
    return { ok: false, error: 'New password must be at least 4 characters long.' }
  }
  const config = await getAdminConfig()
  if (currentPassword !== config.password) {
    return { ok: false, error: 'Current password is incorrect.' }
  }
  await setKv<AdminConfig>(
    ADMIN_CONFIG_KEY,
    {
      password: trimmedNew,
      adminLabel: config.adminLabel || 'Local Admin',
      updatedAt: Date.now(),
    },
    'admin_config'
  )
  return { ok: true }
}

export function useLocalAuth() {
  const [authReady, setAuthReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLabel, setAdminLabel] = useState('Local Admin')

  const refresh = useCallback(() => {
    const session = readSession()
    setIsAdmin(Boolean(session?.authenticated))
    setAdminLabel(session?.label || 'Local Admin')
    setAuthReady(true)
  }, [])

  useEffect(() => {
    let active = true
    ensureLocalDbSeeded().finally(() => {
      if (active) refresh()
    })

    const onAuthChange = () => refresh()
    window.addEventListener(AUTH_EVENT, onAuthChange)
    window.addEventListener('storage', onAuthChange)
    return () => {
      active = false
      window.removeEventListener(AUTH_EVENT, onAuthChange)
      window.removeEventListener('storage', onAuthChange)
    }
  }, [refresh])

  const signOutUser = useCallback(async () => {
    await signOutLocalAdmin()
  }, [])

  return {
    authReady,
    isAdmin,
    adminLabel,
    signOutUser,
  }
}
