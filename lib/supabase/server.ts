// EventSync/lib/supabase/server.ts (Fix for Error 1)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server Component Client (Read-Only Cookies) - Corrected
export function createServerComponentClient() {
  // No need to call cookies() here directly
  // const cookieStore = cookies() // REMOVE THIS

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Call cookies() *inside* the get function
        get(name: string) {
          const cookieStore = cookies() // Get cookies instance when needed
          return cookieStore.get(name)?.value
        },
        // No set/remove needed for read-only server component client
      },
    }
  )
}

// Server Action Client (Read/Write Cookies) - No changes needed here for this specific error
export function createServerActionClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error(`[Action Client] Error setting cookie '${name}':`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
             cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          } catch (error) {
            console.error(`[Action Client] Error removing cookie '${name}':`, error);
          }
        },
      },
    }
  )
}
// You might still need a service role client for admin tasks, keep separate
export function createServiceRoleClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.");
    }
     if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set in environment variables.");
    }

    // Import dynamically ONLY if needed to avoid bundling server key on client
    const { createClient } = require('@supabase/supabase-js');

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}