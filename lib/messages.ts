import { supabase, isSupabaseConfigured } from './supabase'

export type Message = {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  createdAt: number
  read?: boolean
}

export const getMessages = async (): Promise<Message[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('messages').select('*').order('createdAt', { ascending: false })
      if (error) throw error
      if (data) return data as Message[]
    } catch (error) {
      console.error('Error fetching messages from Supabase:', error)
    }
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('sharksite_messages')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {}
    }
  }
  
  return []
}

export const updateMessageInSupabase = async (id: string, updates: Partial<Message>) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('messages').update(updates).eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error updating message in Supabase:', error)
    }
  }
}

export const deleteMessageFromSupabase = async (id: string) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting message from Supabase:', error)
    }
  }
}

export const saveMessage = async (msg: Omit<Message, 'id' | 'createdAt' | 'read'>) => {
  const newMessage: Message = {
    ...msg,
    id: Date.now().toString(),
    createdAt: Date.now(),
    read: false
  }
  
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('messages').insert([newMessage])
    } catch (error) {
      console.error('Error saving message to Supabase:', error)
    }
  }

  const stored = localStorage.getItem('sharksite_messages')
  let messages: Message[] = []
  if (stored) {
    try {
      messages = JSON.parse(stored)
    } catch (e) {
      messages = []
    }
  }
  
  messages.unshift(newMessage) // Add to beginning
  localStorage.setItem('sharksite_messages', JSON.stringify(messages))

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sharksite_new_message', { detail: newMessage }));
  }
}
