"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserClient } from '@/utils/supabase/browser-client'
import { debugSupabaseAuth } from '@/utils/supabase/debug-auth'

export default function LoginSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Function to check authentication and redirect
    const checkAuthAndRedirect = async () => {
      try {
        console.log("Login success page - checking auth...")
        
        // Get Supabase client
        const supabase = getBrowserClient()
        
        // Check for a hash in the URL that might contain access tokens
        const hash = window.location.hash
        console.log("URL hash:", hash ? "Present (length: " + hash.length + ")" : "Not present")
        
        // More robust hash parameter extraction
        let accessToken = null
        let refreshToken = null
        
        if (hash && hash.length > 1) {
          console.log("Attempting to parse hash parameters...")
          // First try standard URLSearchParams approach
          try {
            const params = new URLSearchParams(hash.substring(1))
            accessToken = params.get('access_token')
            refreshToken = params.get('refresh_token')
            console.log("Standard parsing result - Access token:", !!accessToken, "Refresh token:", !!refreshToken)
          } catch (e) {
            console.error("Error with standard hash parsing:", e)
          }
          
          // If standard approach failed, try manual extraction
          if (!accessToken || !refreshToken) {
            console.log("Trying manual hash parameter extraction...")
            const hashParams = hash.substring(1).split('&')
            
            for (const param of hashParams) {
              const [key, value] = param.split('=')
              if (key === 'access_token') accessToken = decodeURIComponent(value)
              if (key === 'refresh_token') refreshToken = decodeURIComponent(value)
            }
            
            console.log("Manual parsing result - Access token:", !!accessToken, "Refresh token:", !!refreshToken)
          }
        }
        
        // If tokens found, set the session
        if (accessToken && refreshToken) {
          console.log("Found tokens in URL, setting session manually...")
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              console.error("Error setting session from URL tokens:", error)
              setError("Failed to initialize session: " + error.message)
              return
            }
            
            if (data.session) {
              console.log("Session set successfully from URL tokens")
              // Write directly to localStorage as a fallback
              try {
                const sessionData = {
                  access_token: accessToken,
                  refresh_token: refreshToken,
                  expires_at: data.session.expires_at,
                  expires_in: data.session.expires_in
                }
                localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData))
                console.log("Manually saved session to localStorage")
              } catch (e) {
                console.error("Error manually saving to localStorage:", e)
              }
            }
          } catch (e) {
            console.error("Exception during setSession:", e)
          }
        } else {
          console.log("No tokens found in URL hash")
        }
        
        // Try to directly parse tokens from localStorage (for debugging)
        try {
          const storedSession = localStorage.getItem('supabase.auth.token')
          if (storedSession) {
            console.log("Found session in localStorage")
            const parsed = JSON.parse(storedSession)
            if (parsed.access_token && parsed.refresh_token && parsed.expires_at) {
              console.log("Session appears valid with expiry:", new Date(parsed.expires_at * 1000).toISOString())
              
              // If we have a valid session in localStorage but failed to set it above,
              // try to set it directly from localStorage as a fallback
              if (!accessToken && !refreshToken) {
                console.log("Attempting to set session from localStorage...")
                try {
                  const { data, error } = await supabase.auth.setSession({
                    access_token: parsed.access_token,
                    refresh_token: parsed.refresh_token
                  })
                  
                  if (error) {
                    console.error("Error setting session from localStorage:", error)
                  } else {
                    console.log("Successfully set session from localStorage")
                  }
                } catch (e) {
                  console.error("Exception setting session from localStorage:", e)
                }
              }
            }
          } else {
            console.log("No session found in localStorage")
          }
        } catch (e) {
          console.error("Error checking localStorage:", e)
        }

        // Show debug info
        await debugSupabaseAuth();
        
        // Add a larger delay to ensure session is processed before checking
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Now get the session - should be available after setting from URL or cookies
        let sessionData = null
        let sessionError = null
        
        try {
          const result = await supabase.auth.getSession()
          sessionData = result.data
          sessionError = result.error
          
          if (sessionError) {
            console.error("Error getting session:", sessionError.message)
          }
          
          console.log("getSession result:", sessionData.session ? "Session found" : "No session found")
        } catch (e) {
          console.error("Exception during getSession:", e)
        }
        
        // Check if we have a session now
        if (sessionData?.session) {
          console.log("Session found for user:", sessionData.session.user.email)
          
          // Determine where to redirect based on user type
          const userType = sessionData.session.user.user_metadata?.userType
          let redirectPath = '/'
          
          if (userType === 'organizer') {
            redirectPath = '/organizer/dashboard'
          } else if (userType === 'participant') {
            redirectPath = '/participant/dashboard'
          }
          
          console.log(`Redirecting to ${redirectPath}...`)
          // Longer delay to ensure session is fully established
          setTimeout(() => {
            router.push(redirectPath)
          }, 1000)
          return
        }
        
        // If we still don't have a session, try code exchange as last resort
        console.error("No session found after token attempts")
        const code = searchParams.get('code')
        if (code) {
          console.log("Found code parameter, exchanging for session...")
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) {
              console.error("Error exchanging code for session:", error.message)
              setError("Failed to authenticate with code: " + error.message)
              return
            }
            
            if (data.session) {
              console.log("Successfully exchanged code for session")
              // Determine where to redirect based on user type
              const userType = data.session.user.user_metadata?.userType
              let redirectPath = '/'
              
              if (userType === 'organizer') {
                redirectPath = '/organizer/dashboard'
              } else if (userType === 'participant') {
                redirectPath = '/participant/dashboard'
              }
              
              console.log(`Redirecting to ${redirectPath}...`)
              setTimeout(() => {
                router.push(redirectPath)
              }, 1000)
              return
            }
          } catch (e) {
            console.error("Exception during code exchange:", e)
            setError("Error during authentication. Please try again.")
            return
          }
        }
        
        // If we get here, we failed to get a session through any method
        setError("No session found. Please try logging in again.")
      } catch (err) {
        console.error("Error in success page:", err)
        setError("An unexpected error occurred. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuthAndRedirect()
  }, [router, searchParams])
  
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border p-6 shadow-md">
          <h1 className="mb-4 text-xl font-bold">Authentication Error</h1>
          <p className="mb-4 text-red-600">{error}</p>
          <div className="mb-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
            <pre>{typeof window !== 'undefined' ? JSON.stringify({
              hash: window.location.hash ? '[present]' : '[not present]',
              hasLocalStorage: typeof localStorage !== 'undefined',
              hasSessionItems: typeof localStorage !== 'undefined' ? 
                Object.keys(localStorage).filter(k => k.includes('supabase')).length > 0 : 'unknown'
            }, null, 2) : 'Server rendering'}</pre>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border p-6 shadow-md">
        <h1 className="mb-4 text-xl font-bold">Login Successful</h1>
        <p className="mb-4">You are now logged in. Redirecting to your dashboard...</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full animate-pulse bg-green-500"></div>
        </div>
      </div>
    </div>
  )
} 