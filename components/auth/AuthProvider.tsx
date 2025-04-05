// EventSync/components/auth/AuthProvider.tsx (Updated to use new client)
'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { User, Session } from '@supabase/supabase-js'
import createClient from '@/lib/supabase/client' // Use the new client factory
import { SupabaseClient } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null // Expose session as well
  isLoading: boolean
  supabase: SupabaseClient // Expose client instance
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Create client instance *once* using the factory
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Get initial session state
    const getInitialSession = async () => {
      setIsLoading(true)
      try {
        // Use getSession instead of getUser for initial load as it doesn't require network request if session exists
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
      } catch (error) {
        console.error('[AuthProvider] Error getting initial session:', error)
        setSession(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sessionState) => {
        console.log('[AuthProvider] Auth state changed:', _event, sessionState ? 'Session found' : 'No session');
        setSession(sessionState)
        setUser(sessionState?.user ?? null)
        setIsLoading(false) // Update loading state on change too
      }
    )

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase]) // Depend on the memoized supabase client

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // State will update via onAuthStateChange listener
    } catch (error) {
      console.error('[AuthProvider] Error signing out:', error)
    }
  }

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    isLoading,
    supabase, // Provide the client instance via context
    signOut
  }), [user, session, isLoading, supabase, signOut]);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}