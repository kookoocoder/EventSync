"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { getBrowserClient, isBrowserEnv, clearBrowserClient } from "@/utils/supabase/browser-client"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshSession: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      if (!isBrowserEnv()) return;
      
      console.log("Refreshing auth session...");
      const supabase = getBrowserClient()
      
      // Attempt to get session from localStorage first
      const storedSession = localStorage.getItem('supabase.auth.token');
      console.log("Stored session exists:", !!storedSession);
      
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Error refreshing session:", error.message)
        setUser(null)
        setSession(null)
        return
      }
      
      if (data?.session) {
        console.log("Session refresh successful", data.session.user.email);
        setSession(data.session)
        setUser(data.session.user)
      } else {
        console.log("No session found during refresh");
        setUser(null)
        setSession(null)
      }
    } catch (error) {
      console.error("Error in refreshSession:", error)
      setUser(null)
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to sign out
  const signOut = async () => {
    try {
      console.log("Signing out...");
      const supabase = getBrowserClient()
      
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      
      if (error) {
        console.error("Error signing out:", error.message);
      } else {
        console.log("Sign out successful");
      }
      
      // Clear state regardless of signOut API result
      setUser(null)
      setSession(null)
      
      // Clear localStorage manually as a fallback
      if (isBrowserEnv()) {
        localStorage.removeItem('supabase.auth.token');
      }
      
      // Clear the client instance to force a new one on next use
      clearBrowserClient();
      
      // Navigate to login
      router.push('/login')
    } catch (error) {
      console.error("Error during sign out:", error)
    }
  }

  // Initialize authentication state
  useEffect(() => {
    if (!isBrowserEnv()) return;
    
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        const supabase = getBrowserClient()
        
        // Check for existing localStorage session
        const storedToken = localStorage.getItem('supabase.auth.token');
        console.log("Initial localStorage check:", !!storedToken ? "Session exists" : "No session");
        
        // Get initial session
        await refreshSession()
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event, newSession?.user?.email || "no user");
            
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
              if (newSession) {
                console.log("Setting authenticated session for:", newSession.user.email);
                setSession(newSession)
                setUser(newSession.user)
                setIsLoading(false)
              }
            } else if (event === "SIGNED_OUT") {
              console.log("User signed out, clearing session");
              setUser(null)
              setSession(null)
              setIsLoading(false)
            } else if (event === "INITIAL_SESSION") {
              if (newSession) {
                console.log("Initial session detected for:", newSession.user.email);
                setSession(newSession)
                setUser(newSession.user)
              } else {
                console.log("No initial session found");
              }
              setIsLoading(false)
            }
          }
        )
        
        // Cleanup function
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setIsLoading(false)
      }
    }
    
    initializeAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 