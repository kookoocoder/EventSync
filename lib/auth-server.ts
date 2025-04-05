// EventSync/lib/auth-server.ts (Updated to use new server client path)
import { redirect } from 'next/navigation'
import { createServerComponentClient } from './supabase/server' // Updated path

// Get the current user from server components
export async function getCurrentUser(options: { redirectOnError?: string } = {}) {
  const supabase = createServerComponentClient()
  const { data, error } = await supabase.auth.getUser()

  if (error && options.redirectOnError) {
    console.error("Error fetching user:", error.message)
    redirect(options.redirectOnError)
  }

  return data.user
}

// Check if user is authenticated, redirect if not
export async function requireAuth(redirectTo: string = '/login') {
  const user = await getCurrentUser({ redirectOnError: redirectTo })

  if (!user) {
    redirect(redirectTo)
  }

  return user
}

// Check if user has specific role, redirect otherwise
export async function requireRole(
  roles: string[],
  redirectTo: string = '/dashboard' // Default redirect if role mismatch
) {
  const user = await requireAuth() // Ensures user is authenticated first
  const userType = user.user_metadata?.userType

  if (!userType || !roles.includes(userType)) {
    console.warn(`Role requirement failed: User type "${userType}" not in required roles [${roles.join(', ')}]. Redirecting to ${redirectTo}.`)
    redirect(redirectTo)
  }

  return user // Return user if role check passes
}

// Keep helper object if preferred
export const Auth = {
  getCurrentUser,
  requireAuth,
  requireOrganizer: () => requireRole(['organizer'], '/dashboard'),
  requireParticipant: () => requireRole(['participant'], '/dashboard'),
}