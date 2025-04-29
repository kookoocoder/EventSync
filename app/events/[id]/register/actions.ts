"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type RegistrationFormData = {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  skills: string;
  experience: string;
  motivation: string;

  // Team Information
  teamStatus: string;
  teamName?: string;
  teamMembers?: string;
  lookingFor?: string;

  // Payment Information
  paymentScreenshot: string;
  transactionId?: string;
};

export async function registerForEvent(eventId: string, formData: RegistrationFormData) {
  try {
    const supabase = createServerActionClient();

    // 1. Get the current user - we need to ensure the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "You must be logged in to register for an event" };
    }

    // 2. Get the participant record for the current user
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("id, name, email")
      .eq("id", user.id)
      .single();
    
    if (participantError || !participant) {
      return { success: false, error: "Participant profile not found" };
    }
    
    // 3. Determine if this is a team registration
    let teamId = null;
    
    if (formData.teamStatus === "have-team" && formData.teamName) {
      // Check if team already exists
      const { data: existingTeam } = await supabase
        .from("teams")
        .select("id")
        .eq("event_id", eventId)
        .eq("name", formData.teamName)
        .single();
      
      if (existingTeam) {
        teamId = existingTeam.id;
      } else {
        // Create a new team
        const teamCode = generateTeamCode();
        const { data: newTeam, error: teamError } = await supabase
          .from("teams")
          .insert({
            event_id: eventId,
            name: formData.teamName,
            creator_id: participant.id,
            team_code: teamCode,
          })
          .select()
          .single();
        
        if (teamError || !newTeam) {
          return { success: false, error: "Failed to create team" };
        }
        
        teamId = newTeam.id;
        
        // Add creator to the team
        await supabase.from("team_members").insert({
          team_id: teamId,
          participant_id: participant.id,
          status: "confirmed"
        });
        
        // Process team members if provided
        if (formData.teamMembers) {
          const teamMemberEmails = formData.teamMembers
            .split("\n")
            .map(email => email.trim())
            .filter(email => email && email !== participant.email);
            
          // For now we're not handling invites for team members
          // This would typically involve sending emails to team members
        }
      }
    }
    
    // 4. Create registration record
    const { error: registrationError } = await supabase
      .from("registrations")
      .insert({
        event_id: eventId,
        participant_id: participant.id,
        team_id: teamId,
        registration_type: formData.teamStatus,
        status: "pending", // Registration requires approval
        payment_status: "pending" // Payment requires verification
      });
    
    if (registrationError) {
      return { success: false, error: "Failed to create registration" };
    }
    
    // 5. Store payment information (in a real system, you'd have a separate table for this)
    // For now, we'll assume the payment screenshot URL is stored, in practice you'd
    // upload this to Supabase Storage and store the path
    
    // 6. Update event's current_participants count
    // This should ideally be done with a database trigger, but for simplicity:
    await supabase.rpc('increment_event_participants', { event_id: eventId });
    
    revalidatePath(`/events/${eventId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error in registerForEvent:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Helper function to generate a random team code
function generateTeamCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
} 