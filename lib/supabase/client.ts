// EventSync/lib/supabase/client.ts (NEW - Replaces lib/supabase.ts and utils/supabase/* browser clients)
"use client" // Mark as client component module

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

// Use Singleton pattern to ensure only one client instance is created.
let client: SupabaseClient | undefined

function createClient() {
  if (client) {
    return client
  }

  client = _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}

export default createClient