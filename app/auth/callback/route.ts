import { createServerActionClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  
  if (code) {
    const cookieStore = cookies()
    const supabase = createServerActionClient()
    
    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code)
      
      // Redirect to the appropriate page
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
    }
  }
  
  // If no code is present, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
} 