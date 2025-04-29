import { notFound } from "next/navigation";

import { createServerComponentClient } from "@/lib/supabase-server";
import { RegistrationsClient } from "./client"; // Import the client component
import { SiteHeader } from "@/components/SiteHeader";
import { type RegistrationUI } from "./client"; // Import the UI type from client

// Type definition for the page props, including params
interface RegistrationsPageProps {
  params: {
    id: string; // Event ID
  };
}

// Helper function to map Supabase data to RegistrationUI
// Keep this mapping logic close to where the data is fetched and passed down
function mapToRegistrationUI(reg: any): RegistrationUI | null {
    if (!reg || !reg.participants) {
        console.warn('Skipping registration due to missing participant data:', reg?.id);
        return null; // Skip if essential data is missing
    }

    // Removed logic related to non-existent reg.events.event_questions
    const questionsMap: Record<string, { question_text: string, question_type: string }> = {};

    // Removed logic related to non-existent reg.registration_answers
    const answersMap: Record<string, string> = {};
    // if (reg.registration_answers) { // Removed block
    //     reg.registration_answers.forEach((ans: any) => {
    //         if (ans.question_id) { 
    //             answersMap[ans.question_id] = ans.answer_text;
    //         }
    //     });
    // }


    return {
        id: reg.id,
        userId: reg.participant_id,
        name: reg.participants.name || 'Unnamed Participant',
        email: reg.participants.email || 'No Email',
        avatarUrl: reg.participants.avatar_url,
        registrationDate: reg.created_at,
        status: reg.status as RegistrationUI['status'], // Assert the type
        answers: answersMap,
        questions: questionsMap, // Pass the mapped questions
    };
}


// --- Server Component --- 
export default async function RegistrationsPage({ params }: RegistrationsPageProps) {
  const eventId = params.id;
  const supabase = createServerComponentClient();

  let eventData: any | null = null;
  let registrationsData: RegistrationUI[] | null = null;
  let fetchError: string | null = null;

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
          participants ( id, name, email, avatar_url )
        )
      `)
      .eq('id', eventId)
      .single(); // Fetch a single event

    if (eventError) throw eventError;
    if (!eventResult) throw new Error("Event not found."); // More specific error

    // TODO: Add authorization check - ensure the current user is the event creator
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user || eventResult.created_by !== user.id) {
    //    throw new Error("Unauthorized access.");
    // }

    eventData = {
        id: eventResult.id,
        name: eventResult.name,
        // Add any other event fields needed by the client, EXCEPT registrations
    };

    // Process registrations
    registrationsData = eventResult.registrations
        .map(mapToRegistrationUI)
        .filter((r: RegistrationUI | null): r is RegistrationUI => r !== null); // Added type to 'r' and ensure type predicate


  } catch (error: any) {
    console.error("Error fetching event registrations:", error);
    fetchError = error.message || "An unexpected error occurred while fetching registration data.";
    // If the error specifically means "not found", trigger Next.js notFound()
    // Adjust this condition based on actual Supabase errors for not found
    if (error.message.includes("not found") || error.code === 'PGRST116') { // PGRST116 often indicates no rows found for .single()
        notFound(); // Renders the not-found page
    }
  }

  // Render the Client Component, passing the fetched data
  return (
    <div className="flex min-h-screen flex-col">
          <SiteHeader />
        {/* Pass data down to the client component */}
        <RegistrationsClient 
            event={eventData} 
            initialRegistrations={registrationsData}
            fetchError={fetchError}
        />
    </div>
  );
}

