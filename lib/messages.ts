import {
  Unsubscribe,
  ensureLocalDbSeeded,
  getAllRecords,
  getRecordById,
  putRecord,
  deleteRecord,
  onCollectionChange,
} from './local-db'

export type Message = {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  createdAt: number
  read?: boolean
}

function mapMessageRecord(data: Message): Message {
  return {
    id: data.id,
    name: String(data.name ?? ''),
    email: String(data.email ?? ''),
    subject: typeof data.subject === 'string' ? data.subject : undefined,
    message: String(data.message ?? ''),
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    read: Boolean(data.read),
  }
}

export async function getMessages(): Promise<Message[]> {
  if (typeof window === 'undefined') return []
  await ensureLocalDbSeeded()
  const items = await getAllRecords<Message>('messages')
  return items
    .map(mapMessageRecord)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export function subscribeToMessages(
  onData: (messages: Message[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  if (typeof window === 'undefined') return () => {}

  let active = true
  const load = async () => {
    try {
      const items = await getMessages()
      if (active) onData(items)
    } catch (err) {
      if (active && onError) onError(err)
    }
  }

  load()
  const unsub = onCollectionChange('messages', load)

  return () => {
    active = false
    unsub()
  }
}

export async function updateMessageRead(id: string, read: boolean): Promise<void> {
  const existing = await getRecordById<Message>('messages', id)
  if (!existing) return
  await putRecord('messages', { ...existing, read }, 'messages')
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteRecord('messages', id, 'messages')
}

export async function saveMessage(
  msg: Omit<Message, 'id' | 'createdAt' | 'read'>
): Promise<Message> {
  await ensureLocalDbSeeded()
  const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const cleanName = msg.name.trim().slice(0, 120)
  const cleanEmail = msg.email.trim().slice(0, 160)
  const cleanMessage = msg.message.trim().slice(0, 5000)
  const cleanSubject = msg.subject?.trim().slice(0, 200)

  const createdMessage: Message = {
    id,
    name: cleanName,
    email: cleanEmail,
    ...(cleanSubject ? { subject: cleanSubject } : {}),
    message: cleanMessage,
    createdAt: Date.now(),
    read: false,
  }

  await putRecord('messages', createdMessage, 'messages')

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sharksite_new_message', { detail: createdMessage }))
  }

  return createdMessage
}

export const deleteMessageFromFirestore = deleteMessage
