import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Create a Supabase client for server components (App Router only)
export const createServerComponentClient = async () => {
  try {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name) {
            try {
              const cookieStore = cookies()
              const cookie = await Promise.resolve(cookieStore.get(name))
              return cookie?.value
            } catch (error) {
              console.error('Error getting cookie in component client:', error)
              return undefined
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('Error creating server component client:', error)
    throw error
  }
}

// Create a Supabase client for server actions (App Router only)
export const createServerActionClient = async () => {
  try {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name) {
            try {
              const cookieStore = cookies()
              const cookie = await Promise.resolve(cookieStore.get(name))
              return cookie?.value
            } catch (error) {
              console.error('Error getting cookie in action client:', error)
              return undefined
            }
          },
          async set(name, value, options) {
            try {
              const cookieStore = cookies()
              await Promise.resolve(cookieStore.set({ name, value, ...options }))
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          async remove(name, options) {
            try {
              const cookieStore = cookies()
              await Promise.resolve(cookieStore.set({ name, value: '', ...options }))
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('Error creating server action client:', error)
    throw error
  }
} 