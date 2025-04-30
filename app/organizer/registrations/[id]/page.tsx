import { notFound } from "next/navigation";

import { createServerComponentClient } from "@/lib/supabase-server";
import { RegistrationsClient } from "./client"; // Import the client component
import { SiteHeader } from "@/components/SiteHeader";
import { type RegistrationUI } from "./actions"; // Import the UI type from actions

// Type definition for the page props, including params
interface RegistrationsPageProps {
  params: {
    id: string; // Event ID
  };
}

// --- Server Component --- 
export default async function RegistrationsPage({ params }: RegistrationsPageProps) {
  // Use the params object asynchronously
  const paramsObj = await Promise.resolve(params);
  const eventId = paramsObj.id;
  
  // Use await to properly initialize the Supabase client
  const supabase = await createServerComponentClient();

  let eventData: any | null = null;
  let registrationsData: RegistrationUI[] | null = null;
  let fetchError: string | null = null;

  try {
    // Fetch the event details first
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, organizer_id')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;
    if (!event) throw new Error("Event not found.");

    eventData = {
        id: event.id,
        name: event.name,
    };

    console.log("Fetching registrations for event:", eventId);
    
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
            r.created_at,
            p.name as participant_name,
            p.email as participant_email,
            p.avatar_url
          FROM 
            registrations r
          LEFT JOIN 
            participants p ON r.participant_id = p.id
          WHERE 
            r.event_id = '${eventId}'
        `
      }
    );
    
    if (directSqlError) {
      console.error("Error with direct SQL query:", directSqlError);
      throw directSqlError;
    }
    
    console.log("Direct SQL query result:", directSqlData);
    
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
        teamId: row.team_id
      }));
    } else {
      // Fall back to separate queries
      console.log("No results from direct SQL, falling back to separate queries");
      
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);
      
      if (regError) throw regError;
      
      console.log(`Found ${registrations?.length || 0} registrations`);
      
      if (registrations && registrations.length > 0) {
        const participantIds = registrations.map(reg => reg.participant_id);
        
        console.log("Participant IDs to fetch:", participantIds);
        
        const { data: participants, error: partError } = await supabase
          .from('participants')
          .select('id, name, email, avatar_url')
          .in('id', participantIds);
        
        if (partError) {
          console.error("Error fetching participants:", partError);
          throw partError;
        }
        
        console.log(`Found ${participants?.length || 0} participants`);
        console.log("Sample participant:", participants?.[0]);
        
        const participantMap: Record<string, any> = {};
        participants?.forEach(p => {
          if (p && p.id) {
            participantMap[p.id] = p;
          }
        });
        
        registrationsData = registrations.map(reg => {
          const participant = participantMap[reg.participant_id];
          
          console.log(`Mapping reg ${reg.id} with participant:`, participant);
          
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
            teamId: reg.team_id
          };
        });
      } else {
        registrationsData = [];
      }
    }

  } catch (error: any) {
    console.error("Error fetching event registrations:", error);
    fetchError = error.message || "An unexpected error occurred while fetching registration data.";
    // If the error specifically means "not found", trigger Next.js notFound()
    if (error.message.includes("not found") || error.code === 'PGRST116') {
        notFound(); // Renders the not-found page
    }
  }

  // Render the Client Component, passing the fetched data
  return (
    <div className="flex min-h-screen flex-col">
          <SiteHeader />
        <RegistrationsClient 
            event={eventData} 
            initialRegistrations={registrationsData}
            fetchError={fetchError}
        />
    </div>
  );
}

