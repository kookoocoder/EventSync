// This file is a compatibility layer for Next.js 15 and Supabase SSR
// It's a workaround for the cookies API changes in Next.js 15
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Create a Supabase client for server components that doesn't 
// need cookie access (it's anonymous and only for read operations)
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 