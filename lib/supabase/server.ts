import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createVanillaClient } from '@supabase/supabase-js'; // Import the standard client

// --- SSR Client for Server Components (Reads Cookies) ---
// Reads cookies from the incoming request for rendering server components.
// Uses cookies() inside the handler to avoid async issues.
export function createServerComponentClient() {
  // console.log("[Supabase Client] Creating Server Component Client");
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const cookieStore = cookies();
            // console.log(`[SC Client] Getting cookie: ${name}`);
            return cookieStore.get(name)?.value;
          } catch (error) {
             // This can happen during static rendering or if cookies() is unavailable.
             // console.error(`[SC Client] Error getting cookie '${name}' (might be static render):`, error);
             return undefined; // Return undefined if cookies cannot be accessed
          }
        },
      },
    }
  );
}

// --- SSR Client for Server Actions / Route Handlers (Reads/Writes Cookies) ---
// Designed for use in contexts where request/response cycle allows cookie modification.
// *May* still face issues with internal calls in some Supabase methods within Actions.
// Reverted to calling cookies() outside based on previous attempts.
export function createServerActionClient() {
    // console.log("[Supabase Client] Creating Server Action/Route Client (SSR Aware)");
    const cookieStore = cookies(); // Get cookies instance for this request/action context
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // console.log(`[Action/Route Client] Getting cookie: ${name}`);
            return cookieStore.get(name)?.value;
           },
          set(name: string, value: string, options: CookieOptions) {
            try {
               // console.log(`[Action/Route Client] Setting cookie: ${name}`);
               cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Avoid throwing errors in log environments during build/SSR
              console.error(`[Action/Route Client] Error setting cookie '${name}':`, error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
               // console.log(`[Action/Route Client] Removing cookie: ${name}`);
               cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            } catch (error) {
              console.error(`[Action/Route Client] Error removing cookie '${name}':`, error);
            }
          },
        },
      }
    );
}

// --- NEW: Vanilla Client for Server-Side (No SSR Cookie Handling) ---
// Use this ONLY when the SSR helpers cause issues within Actions/Routes, like signUp.
// This client CANNOT read/write session cookies automatically via the request context.
export function createVanillaServerClient() {
    // console.log("[Supabase Client] Creating Vanilla Server Client");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
         console.error("Supabase env vars missing for vanilla client.");
         throw new Error("Supabase URL or Anon Key is missing in environment variables for vanilla client.");
     }
    return createVanillaClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                // Disable auth persistence/refresh for this server-only client instance
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            }
        }
    );
}


// --- Service Role Client (Uses Vanilla Client Base) ---
// For admin tasks, bypassing RLS. NEVER expose the service key to the client.
export function createServiceRoleClient() {
    // console.log("[Supabase Client] Creating Service Role Client");
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) { throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set."); }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set."); }
    return createVanillaClient( // Use vanilla base client
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