'use server';

import { redirect } from 'next/navigation';
// Import the VANILLA server client for signUp and SERVICE client for DB ops
import { createVanillaServerClient, createServiceRoleClient } from '@/lib/supabase/server';

// Define the state shape returned by this action
interface RegisterState {
  error: string | null;
}

// Define expected form data structure
type RegisterFormData = {
  email: string;
  password: string;
  name: string;
  userType: 'organizer' | 'participant';
  organizationName?: string;
  organizationAddress?: string;
  organizationWebsite?: string;
  organizationDescription?: string;
};

// Validation function
function validateFormData(data: RegisterFormData): string | null {
    if (!data.email || !data.email.includes('@')) return 'Invalid email address.';
    if (!data.password || data.password.length < 6) return 'Password must be at least 6 characters long.';
    if (!data.name || data.name.trim().length === 0) return 'Full Name is required.';
    if (!data.userType || !['organizer', 'participant'].includes(data.userType)) return 'Invalid user type selected.';
    if (data.userType === 'organizer' && (!data.organizationName || data.organizationName.trim().length === 0)) {
        return 'Organization Name is required for organizers.';
    }
    // Add more validation if needed (e.g., URL format for website)
    return null;
}

export async function register(
    previousState: RegisterState,
    formData: FormData
): Promise<RegisterState> {

    // Use VANILLA client for the signUp call to avoid SSR cookie issues
    const supabaseAuthClient = createVanillaServerClient();
    // Use SERVICE client for DB inserts/updates (bypasses RLS)
    const supabaseService = createServiceRoleClient();

    // Extract data from FormData
    const data: RegisterFormData = {
         email: formData.get('email') as string,
         password: formData.get('password') as string,
         name: formData.get('name') as string,
         userType: formData.get('userType') as 'organizer' | 'participant',
         organizationName: formData.get('organizationName') as string | undefined,
         organizationAddress: formData.get('organizationAddress') as string | undefined,
         organizationWebsite: formData.get('organizationWebsite') as string | undefined,
         organizationDescription: formData.get('organizationDescription') as string | undefined,
    };

    // --- Server-side validation ---
    const validationError = validateFormData(data);
    if (validationError) {
        console.error("[Register Action] Validation failed:", validationError);
        return { error: validationError };
    }

    console.log(`[Register Action] Attempting registration for: ${data.email} as ${data.userType}`);

    // --- Step 1: Create Auth User ---
    const { data: authData, error: signUpError } = await supabaseAuthClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: { // Store essential info in auth metadata
                name: data.name,
                userType: data.userType,
                ...(data.userType === 'organizer' && { organization_name: data.organizationName }) // Conditionally add org name
            },
            // Ensure this points to your callback route, Supabase email templates handle this too
            // emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
    });

    if (signUpError) {
        console.error("[Register Action] Supabase SignUp Error:", signUpError.message);
        // Provide more user-friendly messages
        if (signUpError.message.includes("User already registered")) { return { error: "An account with this email already exists. Please log in or use a different email." }; }
        if (signUpError.message.includes("Password should be at least")) { return { error: "Password does not meet the minimum length requirement (6 characters)." }; }
        return { error: `Registration failed: ${signUpError.message}` }; // Generic fallback
    }

    if (!authData.user || !authData.user.id) {
        console.error("[Register Action] SignUp successful but no user data returned.");
        return { error: 'Registration partially succeeded, cannot create profile. Please contact support.' };
    }

    const userId = authData.user.id;
    console.log(`[Register Action] Auth user created: ${userId}`);

    // --- Step 2: Insert into Role-Specific Table (using SERVICE client) ---
    let dbInsertError: any = null;
    const currentTime = new Date().toISOString();
    const targetTable = data.userType === 'organizer' ? 'organizers' : 'participants';

    try {
        let insertData: any = {
            id: userId, // Link to auth.users table
            name: data.name,
            email: data.email, // Storing email here too based on your schema
            created_at: currentTime,
            updated_at: currentTime,
        };

        if (data.userType === 'organizer') {
            insertData = {
                ...insertData,
                organization_name: data.organizationName, // Now using form data
                organization_address: data.organizationAddress || null,
                organization_website: data.organizationWebsite || null,
                organization_description: data.organizationDescription || null,
                verified: false, // Default to not verified
            };
        } else {
            // For participants, add default null values if needed for bio, skills, etc.
            insertData.bio = null;
            insertData.skills = null;
            insertData.avatar_url = null;
        }

        console.log(`[Register Action] Inserting into '${targetTable}' table for user: ${userId}`);
        const { error: insertError } = await supabaseService.from(targetTable).insert([insertData]);

        if (insertError) {
             // Check for specific errors like unique constraint violation if email exists in target table
             if (insertError.code === '23505') { // Unique violation code
                console.error(`[Register Action] Unique constraint violation inserting into ${targetTable}. User ID: ${userId}, Email: ${data.email}`);
                 dbInsertError = { message: `Profile creation failed: A record with this ID or email might already exist in the ${targetTable} table.`};
             } else {
                throw insertError; // Throw other errors to be caught below
             }
        } else {
            console.log(`[Register Action] '${targetTable}' record created successfully for user: ${userId}`);
        }

    } catch (error: any) {
        console.error(`[Register Action] Error inserting into '${targetTable}' table:`, error.message);
        dbInsertError = error;
        // Consider rolling back the auth user if DB insert fails critically
        // await supabaseService.auth.admin.deleteUser(userId); // Use with extreme caution
    }

    // If DB insert failed, return the error to the user
    if (dbInsertError) {
       console.error(`[Register Action] Database profile creation failed for ${userId} (${data.userType}). Error: ${dbInsertError.message}`);
       return { error: `Account created, but failed to save profile details: ${dbInsertError.message}` };
    }

    // --- Step 3: Redirect to Email Confirmation ---
    // This happens after successful auth user creation AND successful DB profile insert
    console.log(`[Register Action] Registration successful for ${data.email}. Redirecting to email confirmation page.`);
    redirect('/confirm-email');

}