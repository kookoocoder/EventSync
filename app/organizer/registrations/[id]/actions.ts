"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase-server";
import { RegistrationUI } from "./client";

/**
 * Fetches registrations for an event
 * @param eventId - The ID of the event
 */
export async function fetchEventRegistrations(eventId: string) {
  const supabase = createServerActionClient();

  try {
    // Fetch the event details AND its registrations with related data in one go
    const { data: eventResult, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        registrations (
          id,
          event_id,
          participant_id,
          created_at,
          status,
          rejection_reason,
          participants ( id, name, email, avatar_url )
        )
      `)
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;
    if (!eventResult) throw new Error("Event not found.");

    // Authorization check to ensure the current user is the event creator
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");
    
    const { data: organizer, error: organizerError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();
    
    if (organizerError) throw organizerError;
    if (organizer.organizer_id !== user.id) {
      throw new Error("Unauthorized. Only the event organizer can view registrations.");
    }

    // Process registrations - map them to the RegistrationUI format
    const registrationsData = eventResult.registrations
      .map((reg: any): RegistrationUI | null => {
        if (!reg || !reg.participants) {
          return null;
        }
        
        return {
          id: reg.id,
          userId: reg.participant_id,
          name: reg.participants.name || 'Unnamed Participant',
          email: reg.participants.email || 'No Email',
          avatarUrl: reg.participants.avatar_url,
          registrationDate: reg.created_at,
          status: reg.status as RegistrationUI['status'],
          answers: {}, // No answers in this schema yet
          questions: {}, // No questions in this schema yet
        };
      })
      .filter((r: RegistrationUI | null): r is RegistrationUI => r !== null);

    return { 
      event: {
        id: eventResult.id,
        name: eventResult.name,
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
  const supabase = createServerActionClient();

  // 1. Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Authentication required. Please log in.");
  }

  // 2. Check if user is the organizer of this event (authorization)
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    throw new Error("Event not found.");
  }

  if (event.organizer_id !== user.id) {
    throw new Error("Unauthorized. Only the event organizer can approve registrations.");
  }

  // 3. Update the registration status
  const { error: updateError } = await supabase
    .from("registrations")
    .update({ status: "approved" })
    .eq("id", registrationId)
    .eq("event_id", eventId);

  if (updateError) {
    console.error("Error approving registration:", updateError);
    throw new Error("Failed to approve registration.");
  }

  // 4. Revalidate the page to show updated data
  revalidatePath(`/organizer/registrations/${eventId}`);

  return { success: true };
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
  const supabase = createServerActionClient();

  // 1. Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Authentication required. Please log in.");
  }

  // 2. Check if user is the organizer of this event (authorization)
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("organizer_id, current_participants")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    throw new Error("Event not found.");
  }

  if (event.organizer_id !== user.id) {
    throw new Error("Unauthorized. Only the event organizer can reject registrations.");
  }

  // 3. Update the registration status with rejection reason
  const { error: updateError } = await supabase
    .from("registrations")
    .update({ 
      status: "rejected",
      rejection_reason: reason || null 
    })
    .eq("id", registrationId)
    .eq("event_id", eventId);

  if (updateError) {
    console.error("Error rejecting registration:", updateError);
    throw new Error("Failed to reject registration.");
  }

  // 4. Decrement the event's participant count (safely, ensuring it doesn't go below 0)
  const newParticipantCount = Math.max(0, (event.current_participants || 0) - 1);
  
  const { error: decrementError } = await supabase
    .from("events")
    .update({ current_participants: newParticipantCount })
    .eq("id", eventId);

  if (decrementError) {
    // Log but don't fail the operation
    console.error("Error decrementing participant count:", decrementError);
  }

  // 5. Revalidate the page to show updated data
  revalidatePath(`/organizer/registrations/${eventId}`);

  return { success: true };
} 