"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server";

// Updated FormData type to match the simplified generic form
export type RegistrationFormData = {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  skills: string; // Comma-separated string from textarea

  // Team Information (conditional based on event)
  teamStatus: string; // 'solo', 'looking', 'have-team'
  teamName?: string;
  teamMembers?: string;
  lookingFor?: string;

  // Payment Information
  paymentScreenshot: string | null; // Base64 string or null
  transactionId?: string;
};

export async function registerForEvent(eventId: string, formData: RegistrationFormData) {
  try {
    const supabase = createServerActionClient();

    // 1. Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "Authentication required. Please log in." };
    }

    // 2. Check for existing registration for this event by this user
    const { data: existingRegistration, error: checkRegError } = await supabase
      .from("registrations")
      .select("id, status")
      .eq("event_id", eventId)
      .eq("participant_id", user.id)
      .maybeSingle();

    if (checkRegError) {
      console.error("Error checking existing registration:", checkRegError);
      // Log error but allow proceeding if possible
    }
    if (existingRegistration) {
      return { success: false, error: `You are already registered for this event (Status: ${existingRegistration.status}).` };
    }

    // 3. Get or Create Participant Profile
    let participantId = user.id;
    const { data: participantProfile, error: fetchProfileError } = await supabase
      .from("participants")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    
    if (fetchProfileError) {
      console.error("Error fetching participant profile:", fetchProfileError);
      return { success: false, error: "Could not verify your participant profile." };
    }
    
    const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];

    if (!participantProfile) {
      // Create participant profile if it doesn't exist
      const { error: createProfileError } = await supabase
        .from("participants")
        .insert({
          id: user.id,
          name: formData.fullName, // Use name from registration form
          email: user.email,    // Use email from authenticated user
          skills: skillsArray,
          // bio, avatar_url are initially null
        });
      
      if (createProfileError) {
        console.error("Failed to create participant profile:", createProfileError);
        return { success: false, error: "Failed to create your participant profile." };
      }
      } else {
      // Optionally: Update existing participant's skills if they changed in the form?
      // For simplicity, we'll skip updates during registration for now.
      // Profile updates should ideally happen on a dedicated profile page.
       console.log("Participant profile exists, proceeding with registration.");
    }

    // 4. Fetch Event Details (Team Size & Fee)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("registration_fee, min_team_size, max_team_size")
      .eq("id", eventId)
          .single();
        
    if (eventError || !event) {
      console.error("Error fetching event details for registration:", eventError);
      return { success: false, error: "Could not retrieve event details." };
        }
    const eventAllowsTeams = (event.max_team_size ?? 1) > 1;
    const isFreeEvent = !event.registration_fee || Number(event.registration_fee) <= 0;
        
    // 5. Handle Team Logic (only if event allows teams)
    let teamId: string | null = null;
    if (eventAllowsTeams && formData.teamStatus === "have-team") {
      if (!formData.teamName) {
        return { success: false, error: "Team name is required when joining with a team." };
      }
      
      // Find or create the team
      const { team, error: teamError } = await findOrCreateTeam(supabase, eventId, formData.teamName, participantId);
      if (teamError || !team) {
        return { success: false, error: teamError || "Failed to process team information." };
      }
      teamId = team.id;
        
      // Add participant to the team (if not already creator/member)
      await ensureTeamMembership(supabase, teamId, participantId);

      // Handle potential invites (logging only for now)
        if (formData.teamMembers) {
        handlePotentialInvites(formData.teamMembers, user.email || '');
      }
    }

    // 6. Determine Payment Status
    const paymentStatus = isFreeEvent ? "not_required" : "pending";

    // 7. Create the Registration Record
    const { data: newRegistration, error: registrationError } = await supabase
      .from("registrations")
      .insert({
        event_id: eventId,
        participant_id: participantId,
        team_id: teamId, // Null if solo or looking
        registration_type: eventAllowsTeams ? formData.teamStatus : 'solo', // Store how they registered
        status: "pending", // All registrations require organizer approval
        payment_status: paymentStatus,
      })
      .select('id')
      .single();
    
    if (registrationError || !newRegistration) {
      console.error("Failed to create registration record:", registrationError);
      // Check for unique constraint violation (maybe they registered *just* now in another tab?)
      if (registrationError?.message.includes('duplicate key value violates unique constraint "registrations_event_id_participant_id_key"')) {
         return { success: false, error: "You seem to be already registered for this event." };
      }
      return { success: false, error: "Failed to save your registration. Please try again." };
    }

    // 8. Handle Payment Screenshot (Conceptual Upload)
    if (!isFreeEvent && formData.paymentScreenshot) {
      console.log(`Payment screenshot data received for registration ${newRegistration.id}. Would upload to storage.`);
      // Placeholder: Actual upload logic would go here
      // await uploadPaymentScreenshot(supabase, newRegistration.id, formData.paymentScreenshot);
    } else if (!isFreeEvent && !formData.paymentScreenshot) {
      console.warn(`Registration ${newRegistration.id} for paid event submitted without payment screenshot.`);
    }

    // 9. Increment Participant Count
    const { error: countIncrementError } = await supabase.rpc('increment_event_participants', { p_event_id: eventId });
    if (countIncrementError) {
      console.error(`Failed to increment participant count for event ${eventId}:`, countIncrementError);
      // Log error, but don't fail registration
    }

    // 10. Revalidate Paths & Return Success
    revalidatePath(`/events/${eventId}`);
    revalidatePath('/participant/dashboard');
    return { success: true };

  } catch (error: any) {
    console.error("Unexpected error in registerForEvent server action:", error);
    return { success: false, error: error.message || "An unexpected server error occurred during registration." };
  }
}

// --- Helper Functions --- 

// Finds an existing team or creates a new one
async function findOrCreateTeam(supabase: any, eventId: string, teamName: string, creatorId: string) {
  // Check if team exists
  const { data: existingTeam, error: checkError } = await supabase
    .from("teams")
    .select("id")
    .eq("event_id", eventId)
    .eq("name", teamName)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking for team:", checkError);
    return { team: null, error: "Database error checking for team." };
  }

  if (existingTeam) {
    return { team: existingTeam, error: null };
  }

  // Create new team if not found
  const teamCode = generateTeamCode();
  const { data: newTeam, error: createError } = await supabase
    .from("teams")
    .insert({
      event_id: eventId,
      name: teamName,
      creator_id: creatorId,
      team_code: teamCode,
    })
    .select("id")
    .single();

  if (createError || !newTeam) {
    console.error("Error creating new team:", createError);
    return { team: null, error: "Failed to create the team." };
  }

  return { team: newTeam, error: null };
}

// Ensures a participant is a member of a team
async function ensureTeamMembership(supabase: any, teamId: string, participantId: string) {
  const { data: existingMember, error: checkError } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("participant_id", participantId)
    .maybeSingle();

  if (checkError) {
    console.error(`Error checking membership for participant ${participantId} in team ${teamId}:`, checkError);
    return; // Don't block registration, but log
  }

  if (!existingMember) {
    const { error: insertError } = await supabase.from("team_members").insert({
      team_id: teamId,
      participant_id: participantId,
      status: "confirmed", // Assume confirmed if joining via registration
    });
    if (insertError) {
      console.error(`Error adding participant ${participantId} to team ${teamId}:`, insertError);
    }
  }
}

// Parses team member input and logs potential invites
function handlePotentialInvites(teamMembersInput: string | undefined, currentUserEmail?: string | null) {
  if (!teamMembersInput) return;
  const emails = teamMembersInput
    .split(/\r?\n|,/)
    .map(email => email.trim())
    .filter(email => email && email !== currentUserEmail);

  if (emails.length > 0) {
    console.log("Potential team members to invite (emails provided):", emails);
    // Future enhancement: Send actual invites via email or in-app notification
  }
}

// Generates a random alphanumeric code for teams
function generateTeamCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
} 

// Placeholder for potential future screenshot upload logic
// import { decode } from 'base64-arraybuffer';
// async function uploadPaymentScreenshot(supabase: any, registrationId: string, base64Data: string) {
//   try {
//     const filePath = `payments/${registrationId}/screenshot.png`;
//     // Decode base64 (remove prefix like 'data:image/png;base64,')
//     const imageData = decode(base64Data.split(',')[1]); 
//     const { error } = await supabase.storage
//       .from('payment-screenshots') // Ensure this bucket exists and has policies set up
//       .upload(filePath, imageData, { contentType: 'image/png', upsert: true });
//     if (error) throw error;
//     console.log(`Payment screenshot uploaded for registration ${registrationId} to ${filePath}`);
//     // Optionally, update the registration or a payments table with the file path/URL
//   } catch (error) {
//     console.error(`Failed to upload payment screenshot for registration ${registrationId}:`, error);
//   }
// }