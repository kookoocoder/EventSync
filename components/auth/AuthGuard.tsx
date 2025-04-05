// EventSync/components/auth/AuthGuard.tsx (No structural changes needed, relies on AuthProvider)
'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation' // Added usePathname
import { useAuth } from './AuthProvider'

type AuthGuardProps = {
  children: React.ReactNode
  userTypes?: ('organizer' | 'participant')[]
  // Add a prop to control redirect behavior on auth failure
  requireAuth?: boolean
}

export default function AuthGuard({
  children,
  userTypes,
  requireAuth = true // Default to requiring authentication
}: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname() // Get current path

  useEffect(() => {
    // Skip checks during loading
    if (isLoading) {
      return;
    }

    // --- Authentication Check ---
    if (requireAuth && !user) {
      console.log(`[AuthGuard] User not authenticated on ${pathname}. Redirecting to login.`);
      // Preserve the current path for redirection after login
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('next', pathname);
      router.replace(loginUrl.toString()); // Use replace to avoid adding login to history
      return; // Stop further checks
    }

    // --- Authorization (Role) Check ---
    if (user && userTypes && userTypes.length > 0) {
      const userType = user.user_metadata?.userType
      if (!userType || !userTypes.includes(userType as any)) {
        console.log(`[AuthGuard] User type "${userType}" not authorized for ${pathname} (requires: ${userTypes.join(', ')}). Redirecting to dashboard.`);
        router.replace('/dashboard'); // Redirect to a default safe page
        return; // Stop further checks
      }
    }

    // If all checks pass, the component is allowed to render children
    console.log(`[AuthGuard] User ${user ? 'authenticated and authorized' : 'not authenticated (but auth not required)'} for ${pathname}.`)

  }, [user, isLoading, router, userTypes, requireAuth, pathname])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // --- Render Logic ---
  // Render children only if:
  // 1. Auth is required AND user is authenticated AND authorization passed (if applicable)
  // 2. Auth is NOT required
  const isAuthorized = user && userTypes && userTypes.length > 0
    ? user.user_metadata?.userType && userTypes.includes(user.user_metadata.userType as any)
    : true; // Assume authorized if no specific types are required

  if ((requireAuth && user && isAuthorized) || !requireAuth) {
    return <>{children}</>
  }

  // If checks failed and redirection is happening, render nothing to avoid flashes
  return null
}