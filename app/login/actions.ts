'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Basic validation
  if (!email || !password) {
    return redirect('/login?error=' + encodeURIComponent('Email and password are required.'))
  }

  console.log("Login attempt for:", email)

  // Set up the Supabase client for server-side authentication
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // Don't persist in server context
        flowType: 'pkce', // Use PKCE flow for better security and compatibility
      },
      global: {
        headers: {
          'X-Client-Info': 'nextjs-login-action',
        },
      },
    }
  )

  try {
    // Sign in with password
    console.log("Attempting sign in with password...")
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error("Login Error:", signInError)
      return redirect('/login?error=' + encodeURIComponent(signInError.message || 'Could not authenticate user.'))
    }

    if (!signInData.session) {
      console.error("No session created during login")
      return redirect('/login?error=' + encodeURIComponent('Session could not be established'))
    }

    console.log("Login successful - Session established with expiry:", new Date(signInData.session.expires_at! * 1000).toISOString())
    
    // Get the user data
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()

    if (getUserError || !user) {
      console.error("Error fetching user after login:", getUserError)
      return redirect('/login?error=' + encodeURIComponent('Failed to retrieve user session.')) 
    }

    // Check user metadata for userType
    const userType = user.user_metadata?.userType
    console.log("User type from metadata:", userType)

    // For PKCE flow, we'll manually encode the session into the URL
    const successPath = '/login/success'
    
    // Revalidate path before redirecting
    revalidatePath('/', 'layout')
    
    // Extract tokens from the session
    const session = signInData.session
    const accessToken = session.access_token
    const refreshToken = session.refresh_token
    
    if (!accessToken || !refreshToken) {
      console.error("Missing tokens in session")
      return redirect('/login?error=' + encodeURIComponent('Invalid session data'))
    }
    
    // Log session details for debugging
    console.log("Session data for redirecting:", {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken.length,
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken.length,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'unknown'
    })
    
    // Create a properly formatted redirect URL with hash parameters
    // Using proper URL encoding for each parameter
    const hashParams = [
      `access_token=${encodeURIComponent(accessToken)}`,
      `refresh_token=${encodeURIComponent(refreshToken)}`,
      `expires_in=${session.expires_in || 3600}`,
      `token_type=bearer`,
      `type=auth`
    ].join('&')
    
    const redirectUrl = `${successPath}#${hashParams}`
    
    console.log("Redirecting to success page with tokens in hash...")
    return redirect(redirectUrl)
  } catch (err) {
    console.error("Unexpected error during login:", err)
    return redirect('/login?error=' + encodeURIComponent('An unexpected error occurred during login.'))
  }
} 