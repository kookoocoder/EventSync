// Use this client in Server Actions and Route Handlers only
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { type CookieOptions } from '@supabase/ssr'

// Function to manually handle cookies for server actions in Next.js 15
export function createActionClient(cookieStore: any) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          // Send the current cookies with each request to preserve auth state
          Cookie: Object.entries(cookieStore)
            .map(([name, value]) => `${name}=${value}`)
            .join('; '),
        },
      },
    }
  )
} 