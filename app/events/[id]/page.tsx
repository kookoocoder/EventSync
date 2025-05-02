import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase/server";
import EventDetails from "./EventDetails";

export async function generateMetadata(props: { params: { id: string } }): Promise<Metadata> {
  const { id } = props.params;

  const supabase = await createServerComponentClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: event.name,
    description: event.description || "Event details",
  };
}

export default async function EventPage({ 
  params: { id } 
}: { 
  params: { id: string } 
}) {
  const supabase = await createServerComponentClient();
  
  // Check if event exists
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
    
  if (!event) {
    notFound();
  }
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if user is already registered
  let registration = null;
  if (user) {
    const { data: regData } = await supabase
      .from("registrations")
      .select("id, status, payment_status")
      .eq("event_id", id)
      .eq("participant_id", user.id)
      .maybeSingle();
    
    registration = regData;
  }

  // Pass all server-fetched data to the client component
  return <EventDetails 
    id={id} 
    initialEvent={event} 
    userRegistration={registration}
    userId={user?.id}
  />;
}