// EventSync/lib/auth.ts (Updated to use new client path)
import createClient from './supabase/client' // Updated path
import { User, AuthError } from '@supabase/supabase-js'

// Types for auth functions
type SignInData = {
  email: string
  password: string
}

type SignUpData = SignInData & {
  username?: string
  name?: string
  userType?: 'organizer' | 'participant'
}

type AuthResponse = {
  user: User | null
  error: AuthError | null
}

// Auth service using the Singleton client
export const AuthService = {
  // Sign in with email and password
  async signInWithPassword({ email, password }: SignInData): Promise<AuthResponse> {
    const supabase = createClient() // Use the singleton client
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return {
      user: data?.user || null,
      error
    }
  },

  // Sign up with email and password
  async signUp({ email, password, username, name, userType }: SignUpData): Promise<AuthResponse> {
    const supabase = createClient() // Use the singleton client
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          name,
          userType
        }
      }
    })

    // Note: Profile creation should ideally happen via a trigger or server-side
    // to ensure atomicity and security, but keeping it here for simplicity based on original code.
    if (!error && data.user) {
      try {
        // Consider adding role-based tables (organizers, participants) instead of just profiles if data differs significantly
        await supabase
          .from('profiles') // Ensure 'profiles' table exists and RLS allows authenticated users to insert their own profile
          .insert([{
            id: data.user.id,
            username,
            name,
            user_type: userType, // Store user type here as well if needed
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(), // Add updated_at
          }])
          .select()
          .single()
      } catch (profileError: any) {
        console.error('Error creating profile:', profileError)
        // Don't block signup, maybe log this for manual intervention
        // Optionally return a specific error/warning about profile creation
      }
    }

    return {
      user: data?.user || null,
      error
    }
  },

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    const supabase = createClient() // Use the singleton client
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session (primarily for client-side checks if needed)
  async getSession() {
    const supabase = createClient() // Use the singleton client
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  // Get current user (primarily for client-side checks if needed)
  async getUser() {
    const supabase = createClient() // Use the singleton client
    const { data } = await supabase.auth.getUser()
    return data.user
  },

  // Reset password
  async resetPassword(email: string) {
    const supabase = createClient() // Use the singleton client
    // Ensure NEXT_PUBLIC_SITE_URL is correctly set for the redirect path
    const redirectUrl = new URL('/auth/reset-password', process.env.NEXT_PUBLIC_SITE_URL || window.location.origin)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl.toString()
    })
    return { error }
  },

  // Update password (requires user to be logged in)
  async updatePassword(password: string) {
    const supabase = createClient() // Use the singleton client
    const { error } = await supabase.auth.updateUser({
      password
    })
    return { error }
  }
}