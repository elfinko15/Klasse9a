import { createClient } from '@supabase/supabase-js'

export type DbUser = {
  id: string
  name: string
  username: string
  password_hash: string
  role: 'admin' | 'student'
  bio: string
  profile_picture_url: string | null
  created_at: string
}

export type DbComment = {
  id: string
  target_user_id: string
  author_id: string
  message: string
  created_at: string
}

export type CommentWithAuthor = DbComment & {
  author: { name: string; username: string }
}

const url = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

// Service role client: bypasses RLS – nur server-seitig verwenden!
export const db = createClient(url, key, {
  auth: { persistSession: false },
})
