'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Define the expected shape of the form data (matching your Zod schema)
interface FormData {
  name: string;
  email: string;
  password: string;
  userType: 'participant' | 'organizer';
  organizationName?: string;
  organizationAddress?: string;
  organizationWebsite?: string;
  organizationDescription?: string;
}

export async function registerUser(formData: FormData) {
  console.log("Registration attempt for:", formData.email, "as", formData.userType)

  // 1. Use the standard client (with anon key) to sign up the user
  const supabaseAnonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'supabase.auth.token',
      },
      global: {
        headers: {
          'X-Client-Info': 'nextjs-register-action',
        },
      },
    }
  )

  const data = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      userType: formData.userType,
      organizationName: formData.organizationName,
      organizationAddress: formData.organizationAddress,
      organizationWebsite: formData.organizationWebsite,
      organizationDescription: formData.organizationDescription,
  }

  const { data: authData, error: authError } = await supabaseAnonClient.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        userType: data.userType,
      },
    },
  })

  if (authError) {
    console.error("Auth Error:", authError)
    return redirect('/register?error=' + encodeURIComponent(authError.message || 'Could not authenticate user.'))
  }

  if (!authData.user) {
    console.error("No user data after signup")
    return redirect('/register?error=' + encodeURIComponent('Signup failed. Please try again.'))
  }

  console.log("User registered successfully, now creating profile...")

  // 2. Use the Service Role Key to insert the profile, bypassing RLS for this specific trusted operation.
  // Ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Service Role Key not configured.")
    return redirect('/register?error=' + encodeURIComponent('Server configuration error.'))
  }

  // Create a separate client instance initialized with the service role key
  const supabaseServiceRoleClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { 
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          'X-Client-Info': 'nextjs-register-service-role',
        },
      },
    }
  );

  try {
    if (data.userType === 'participant') {
      const { error: profileError } = await supabaseServiceRoleClient
        .from('participants')
        .insert({
          id: authData.user.id, // Use the ID from the successful signup
          name: data.name,
          email: data.email,
        })
      if (profileError) throw profileError // Re-throw to be caught below
    } else if (data.userType === 'organizer') {
      const { error: profileError } = await supabaseServiceRoleClient
        .from('organizers')
        .insert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          organization_name: data.organizationName!, 
          organization_address: data.organizationAddress,
          organization_website: data.organizationWebsite || null,
          organization_description: data.organizationDescription,
        })
      if (profileError) throw profileError // Re-throw to be caught below
    }
    
    console.log("Profile created successfully for user:", authData.user.id)
  } catch (profileError: any) {
    console.error("Profile Insertion Error (Service Role Client):", profileError)
    return redirect('/register?error=' + encodeURIComponent(`Failed to create profile: ${profileError.message}`))
  }

  // 3. Signup and profile creation successful
  revalidatePath('/', 'layout')
  return redirect('/confirm-email') 
} 