"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase-server";

export interface RegistrationUI {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  registrationDate: string;
  status: "pending" | "approved" | "rejected";
  registrationType: string;
  paymentStatus: string | null;
  teamId: string | null;
  rejection_reason?: string | null;
  paymentScreenshot?: string | null;
}

/**
 * Fetches registrations for an event
 * @param eventId - The ID of the event
 */
export async function fetchEventRegistrations(eventId: string) {
  // Ensure parameters are treated as async values
  const resolvedEventId = await Promise.resolve(eventId);
  
  // Use await for the supabase client
  const supabase = await createServerActionClient();

  try {
    // Fetch the event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, organizer_id')
      .eq('id', resolvedEventId)
      .single();

    if (eventError) throw eventError;
    if (!event) throw new Error("Event not found.");

    // Authorization check to ensure the current user is the event organizer
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");
    
    if (event.organizer_id !== user.id) {
      throw new Error("Unauthorized. Only the event organizer can view registrations.");
    }

    console.log("Fetching registrations for event (server action):", resolvedEventId);
    
    // Execute a raw SQL query to get registrations with participant data directly
    const { data: directSqlData, error: directSqlError } = await supabase.rpc(
      'direct_query', 
      { 
        query_text: `
          SELECT 
            r.id as registration_id,
            r.event_id,
            r.participant_id,
            r.team_id,
            r.registration_type,
            r.status,
            r.payment_status,
            r.rejection_reason,
            r.payment_screenshot,
            r.created_at,
            p.name as participant_name,
            p.email as participant_email,
            p.avatar_url
          FROM 
            registrations r
          LEFT JOIN 
            participants p ON r.participant_id = p.id
          WHERE 
            r.event_id = '${resolvedEventId}'
        `
      }
    );
    
    if (directSqlError) {
      console.error("Error with direct SQL query (server action):", directSqlError);
    }
    
    console.log("Direct SQL query result (server action):", directSqlData);
    
    let registrationsData: RegistrationUI[] = [];
    
    if (directSqlData && directSqlData.length > 0) {
      // Map the data from the direct SQL result
      registrationsData = directSqlData.map((row: any) => ({
        id: row.registration_id,
        userId: row.participant_id,
        name: row.participant_name || 'Unnamed Participant',
        email: row.participant_email || 'No Email',
        avatarUrl: row.avatar_url,
        registrationDate: row.created_at,
        status: row.status as RegistrationUI['status'],
        registrationType: row.registration_type,
        paymentStatus: row.payment_status,
        teamId: row.team_id,
        rejection_reason: row.rejection_reason,
        paymentScreenshot: row.payment_screenshot
      }));
    } else {
      // Fall back to separate queries
      console.log("No results from direct SQL, falling back to separate queries (server action)");
      
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', resolvedEventId);
      
      if (regError) throw regError;
      
      console.log(`Found ${registrations?.length || 0} registrations (server action)`);
      
      if (registrations && registrations.length > 0) {
        const participantIds = registrations.map(reg => reg.participant_id);
        
        // Fetch all corresponding participants in one query
        const { data: participants, error: partError } = await supabase
          .from('participants')
          .select('*')
          .in('id', participantIds);
          
        if (partError) throw partError;
        
        console.log(`Found ${participants?.length || 0} participants (server action)`);
        
        // Create a map of participant data for easy lookup
        const participantMap = participants?.reduce((map, participant) => {
          map[participant.id] = participant;
          return map;
        }, {} as Record<string, any>) || {};
        
        // Map the registrations with participant data
        registrationsData = registrations.map(reg => {
          const participant = participantMap[reg.participant_id];
        
        return {
          id: reg.id,
          userId: reg.participant_id,
            name: participant?.name || 'Unnamed Participant',
            email: participant?.email || 'No Email',
            avatarUrl: participant?.avatar_url,
          registrationDate: reg.created_at,
          status: reg.status as RegistrationUI['status'],
            registrationType: reg.registration_type,
            paymentStatus: reg.payment_status,
            teamId: reg.team_id,
            rejection_reason: reg.rejection_reason,
            paymentScreenshot: reg.payment_screenshot
        };
        });
      }
    }

    return { 
      event: {
        id: event.id,
        name: event.name,
      },
      registrations: registrationsData,
      success: true 
    };
  } catch (error: any) {
    console.error("Error fetching event registrations:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred." 
    };
  }
}

/**
 * Approves a registration for an event
 * @param eventId - The ID of the event
 * @param registrationId - The ID of the registration to approve
 */
export async function approveRegistrationAction(eventId: string, registrationId: string) {
  // Ensure parameters are treated as async values
  const resolvedEventId = await Promise.resolve(eventId);
  const resolvedRegistrationId = await Promise.resolve(registrationId);
  
  // Use await for the supabase client
  const supabase = await createServerActionClient();

  console.log("=== APPROVE REGISTRATION ACTION ===");
  console.log("eventId:", resolvedEventId);
  console.log("registrationId:", resolvedRegistrationId);

  try {
  // 1. Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
      console.error("Authentication error:", userError);
    throw new Error("Authentication required. Please log in.");
  }
    
    console.log("User ID:", user.id);

  // 2. Check if user is the organizer of this event (authorization)
  const { data: event, error: eventError } = await supabase
    .from("events")
      .select("organizer_id, current_participants, max_participants")
      .eq("id", resolvedEventId)
    .single();

    if (eventError) {
      console.error("Event fetch error:", eventError);
      throw new Error("Event not found.");
    }
    if (!event) {
      console.error("Event not found with ID:", resolvedEventId);
    throw new Error("Event not found.");
  }

    console.log("Event data:", event);

  if (event.organizer_id !== user.id) {
      console.error("Authorization error: User is not the organizer");
      console.log("Event organizer_id:", event.organizer_id);
      console.log("User id:", user.id);
    throw new Error("Unauthorized. Only the event organizer can approve registrations.");
  }

    // 3. Get the current registration status
    const { data: registration, error: regError } = await supabase
    .from("registrations")
      .select("status")
      .eq("id", resolvedRegistrationId)
      .single();

    if (regError) {
      console.error("Registration fetch error:", regError);
      throw new Error("Registration not found.");
    }

    console.log("Current registration status:", registration.status);

    // Skip if already approved
    if (registration.status === "approved") {
      console.log("Registration already approved, skipping update");
      return { success: true, message: "Registration already approved." };
    }

    // Check if event has reached maximum participants
    if (event.max_participants !== null && event.current_participants >= event.max_participants) {
      console.error("Event has reached maximum participants");
      console.log("Current participants:", event.current_participants);
      console.log("Max participants:", event.max_participants);
      throw new Error("Cannot approve: Event has reached maximum number of participants.");
    }

    console.log("Updating registration status to approved:", resolvedRegistrationId);
    
    // 4. Update the registration status
    const { data: updateResult, error: updateError } = await supabase
      .from("registrations")
      .update({ 
        status: "approved",
        updated_at: new Date().toISOString()
      })
      .eq("id", resolvedRegistrationId)
      .select();

  if (updateError) {
    console.error("Error approving registration:", updateError);
    throw new Error("Failed to approve registration.");
  }

    console.log("Update result:", updateResult);

    // 5. Increment the event's participant count
    const newParticipantCount = (event.current_participants || 0) + 1;
    
    console.log("Incrementing participant count to:", newParticipantCount);
    
    const { data: incrementResult, error: incrementError } = await supabase
      .from("events")
      .update({ current_participants: newParticipantCount })
      .eq("id", resolvedEventId)
      .select();

    if (incrementError) {
      console.error("Error incrementing participant count:", incrementError);
      // Don't fail the operation, just log the error
    }

    console.log("Increment result:", incrementResult);

    // Try a direct SQL update as a fallback if needed
    if (!updateResult || updateResult.length === 0) {
      console.log("Fallback: Using direct SQL to update registration");
      
      const { data: directSqlResult, error: directSqlError } = await supabase.rpc(
        'direct_query',
        { 
          query_text: `
            UPDATE registrations 
            SET status = 'approved', updated_at = NOW() 
            WHERE id = '${resolvedRegistrationId}' 
            RETURNING id, status
          `
        }
      );
      
      console.log("Direct SQL update result:", directSqlResult);
      if (directSqlError) {
        console.error("Direct SQL update error:", directSqlError);
      }
    }

    // 6. Revalidate the page to show updated data
    revalidatePath(`/organizer/registrations/${resolvedEventId}`);

    console.log("Approval completed successfully");
    return { success: true, message: "Registration approved successfully." };
  } catch (error: any) {
    console.error("Error in approveRegistrationAction:", error);
    throw error;
  }
}

/**
 * Rejects a registration for an event
 * @param eventId - The ID of the event
 * @param registrationId - The ID of the registration to reject
 * @param reason - Optional reason for the rejection
 */
export async function rejectRegistrationAction(
  eventId: string, 
  registrationId: string, 
  reason: string = ""
) {
  // Ensure parameters are treated as async values
  const resolvedEventId = await Promise.resolve(eventId);
  const resolvedRegistrationId = await Promise.resolve(registrationId);
  const resolvedReason = await Promise.resolve(reason);
  
  // Use await for the supabase client
  const supabase = await createServerActionClient();

  console.log("=== REJECT REGISTRATION ACTION ===");
  console.log("eventId:", resolvedEventId);
  console.log("registrationId:", resolvedRegistrationId);
  console.log("reason:", resolvedReason);

  try {
  // 1. Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
      console.error("Authentication error:", userError);
    throw new Error("Authentication required. Please log in.");
  }
    
    console.log("User ID:", user.id);

  // 2. Check if user is the organizer of this event (authorization)
  const { data: event, error: eventError } = await supabase
    .from("events")
      .select("organizer_id")
      .eq("id", resolvedEventId)
    .single();

    if (eventError) {
      console.error("Event fetch error:", eventError);
      throw new Error("Event not found.");
    }
    if (!event) {
      console.error("Event not found with ID:", resolvedEventId);
    throw new Error("Event not found.");
  }

    console.log("Event data:", event);

  if (event.organizer_id !== user.id) {
      console.error("Authorization error: User is not the organizer");
      console.log("Event organizer_id:", event.organizer_id);
      console.log("User id:", user.id);
    throw new Error("Unauthorized. Only the event organizer can reject registrations.");
  }

    // 3. Get the current registration status
    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .select("status")
      .eq("id", resolvedRegistrationId)
      .single();

    if (regError) {
      console.error("Registration fetch error:", regError);
      throw new Error("Registration not found.");
    }

    console.log("Current registration status:", registration.status);

    // If registration was already approved, we need to decrement the participant count
    const wasApproved = registration.status === "approved";
    console.log("Registration was previously approved:", wasApproved);

    // 4. Update the registration status
    const { data: updateResult, error: updateError } = await supabase
    .from("registrations")
    .update({ 
      status: "rejected",
      rejection_reason: resolvedReason,
      updated_at: new Date().toISOString()
    })
      .eq("id", resolvedRegistrationId)
      .select();

  if (updateError) {
    console.error("Error rejecting registration:", updateError);
    throw new Error("Failed to reject registration.");
  }

    console.log("Update result:", updateResult);

    // Try a direct SQL update as a fallback if needed
    if (!updateResult || updateResult.length === 0) {
      console.log("Fallback: Using direct SQL to update registration");
      
      const { data: directSqlResult, error: directSqlError } = await supabase.rpc(
        'direct_query',
        { 
          query_text: `
            UPDATE registrations 
            SET status = 'rejected', rejection_reason = '${resolvedReason.replace(/'/g, "''")}', updated_at = NOW() 
            WHERE id = '${resolvedRegistrationId}' 
            RETURNING id, status, rejection_reason
          `
        }
      );
      
      console.log("Direct SQL update result:", directSqlResult);
      if (directSqlError) {
        console.error("Direct SQL update error:", directSqlError);
      }
    }

    // 5. If the registration was previously approved, decrement the event's participant count
    if (wasApproved) {
      const { data: currentEvent } = await supabase
        .from("events")
        .select("current_participants")
        .eq("id", resolvedEventId)
        .single();
      
      if (currentEvent) {
        const newParticipantCount = Math.max(0, (currentEvent.current_participants || 0) - 1);
        
        console.log("Decrementing participant count to:", newParticipantCount);
  
        const { data: decrementResult, error: decrementError } = await supabase
    .from("events")
    .update({ current_participants: newParticipantCount })
          .eq("id", resolvedEventId)
          .select();

        console.log("Decrement result:", decrementResult);
  if (decrementError) {
    console.error("Error decrementing participant count:", decrementError);
  }
      }
    }

    // 6. Revalidate the page to show updated data
    revalidatePath(`/organizer/registrations/${resolvedEventId}`);

    console.log("Rejection completed successfully");
    return { success: true, message: "Registration rejected successfully." };
  } catch (error: any) {
    console.error("Error in rejectRegistrationAction:", error);
    throw error;
  }
} 