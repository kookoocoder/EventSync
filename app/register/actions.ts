// EventSync/app/register/actions.ts (Corrected Signature)
'use server'

import { redirect } from 'next/navigation'
import { createServerActionClient } from '@/lib/supabase/server' // Correct path

// Define the state shape for this action
interface RegisterState {
  error: string | null;
}

type RegisterFormData = {
  email: string
  password: string
  username: string
  name: string
  userType: 'organizer' | 'participant'
}

// Helper function for validation (keep as is)
function validateFormData(data: RegisterFormData): string | null {
    // ... validation logic ...
    if (!data.email || !data.email.includes('@')) return 'Invalid email address.';
    if (!data.password || data.password.length < 6) return 'Password must be at least 6 characters long.'; // Supabase default is 6
    if (!data.username || data.username.length < 3) return 'Username must be at least 3 characters long.';
    if (!data.name) return 'Full Name is required.';
    if (!data.userType || !['organizer', 'participant'].includes(data.userType)) return 'Invalid user type selected.';
    return null;
}

// CORRECTED Signature: Accepts previousState and formData
export async function register(
    previousState: RegisterState, // First argument
    formData: FormData           // Second argument
): Promise<RegisterState> {     // Return type matches state
  const supabase = createServerActionClient()

  // Extract data from FormData
  const data: RegisterFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    username: formData.get('username') as string,
    name: formData.get('name') as string,
    userType: formData.get('userType') as 'organizer' | 'participant',
  };

  // Server-side validation
  const validationError = validateFormData(data);
  if (validationError) {
      console.error("Registration validation failed:", validationError);
      return { error: validationError }; // Return error state
  }

  console.log(`[Register Action] Attempting registration for: ${data.email}`);
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        username: data.username,
        name: data.name,
        userType: data.userType // Store userType in auth metadata
      }
      // Add emailRedirectTo if you want confirmation emails to link back correctly
      // emailRedirectTo: `${new URL(request.url).origin}/auth/callback` // Requires passing request or origin
    }
  })

  if (error) {
    console.error("[Register Action] Supabase SignUp Error:", error.message);
    if (error.message.includes("User already registered")) {
         return { error: "An account with this email already exists. Please log in." };
    }
    if (error.message.includes("Password should be at least")) {
        return { error: "Password does not meet the minimum length requirement (6 characters)." };
    }
     if (error.message.includes("check constraint violation")) {
         // This often means RLS prevented the insert or there's a constraint on the table
         console.error("[Register Action] Potential RLS or DB Constraint issue during profile insert.");
         return { error: "Registration failed due to a database constraint. Please contact support." };
    }
    return { error: `Registration failed: ${error.message}` };
  }

   if (!authData.user || !authData.user.id) {
        console.error("[Register Action] SignUp successful but no user data returned.");
        return { error: 'Registration partially succeeded, but failed to initialize profile. Please contact support.' };
   }

  console.log(`[Register Action] User signed up: ${authData.user.id}, Email: ${authData.user.email}`);

  // Create profile in database (ensure RLS allows this)
  try {
    console.log(`[Register Action] Attempting to insert profile for user: ${authData.user.id}`);
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id, // Ensure this matches the user ID from auth
        username: data.username,
        name: data.name,
        user_type: data.userType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (profileError) {
      // Log the specific profile error, but don't necessarily block redirect
      console.error('[Register Action] Error creating profile (non-blocking):', profileError);
      // You could potentially return a state indicating partial success here if needed
      // return { error: "Account created, but profile setup failed. Please update your profile later." };
    } else {
        console.log(`[Register Action] Profile inserted successfully for user: ${authData.user.id}`);
    }
  } catch (err) {
    console.error('[Register Action] Profile creation exception (non-blocking):', err);
  }

  // --- Redirect based on email confirmation status ---
   if (authData.user.identities?.length === 0 || !authData.user.email_confirmed_at) {
    // Check if confirmation is required (no identity or email not confirmed)
    // This check might vary slightly based on your Supabase settings
    console.log(`[Register Action] User ${data.email} registered, needs email confirmation.`);
    redirect('/confirm-email') // Redirect to a page telling them to check their email
  } else {
    // Auto-confirmed or confirmation not required
    console.log(`[Register Action] User ${data.email} registered and confirmed.`);
    redirect('/login?message=registration_successful') // Redirect to login with a success message
  }

  // This is unreachable if redirect occurs, but needed for type safety if redirect was conditional
  // return { error: null };
}