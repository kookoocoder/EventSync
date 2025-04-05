// EventSync/app/login/actions.ts (Corrected Signature)
'use server'

import { redirect } from 'next/navigation'
import { createServerActionClient } from '@/lib/supabase/server' // Correct path

// Define the state shape returned by this action
interface LoginState {
  error: string | null;
}

// CORRECTED Signature: Accepts previousState and formData
export async function login(
    previousState: LoginState, // First argument is the previous state
    formData: FormData         // Second argument is the FormData payload
): Promise<LoginState> {       // Return type matches the state shape
  const supabase = createServerActionClient()

  // Now you can safely use formData.get()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    console.log("[Login Action] Email or password missing.");
    return { error: "Email and password are required." };
  }

  console.log(`[Login Action] Attempting login for: ${email}`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error(`[Login Action] Login failed for ${email}:`, error.message);
    return { error: `Login failed: ${error.message}` } // Return error state
  }

  if (!data.user) {
      console.error(`[Login Action] Login successful but no user data returned for ${email}.`);
      return { error: 'Login succeeded but failed to retrieve user data.' }; // Return error state
  }

  console.log(`[Login Action] Login successful for user: ${data.user.id}, email: ${data.user.email}`);

  // --- Redirect on Success ---
  // IMPORTANT: Redirects must happen *outside* the try/catch or state return logic
  // for server actions. Returning state means the redirect won't happen immediately.
  // The redirect function throws an error specifically designed to be caught by Next.js
  // to perform the navigation.

  const userType = data.user.user_metadata?.userType
  let redirectPath = '/dashboard' // Default

  if (userType === 'organizer') {
    redirectPath = '/organizer/dashboard'
  } else if (userType === 'participant') {
    redirectPath = '/participant/dashboard'
  }
  console.log(`[Login Action] Redirecting to: ${redirectPath}`);
  redirect(redirectPath)

  // This part is technically unreachable because redirect() throws,
  // but included for type correctness if redirect was conditional.
  // return { error: null };
}