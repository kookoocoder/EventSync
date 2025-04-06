// EventSync/lib/services/event-service.ts
import { createServerComponentClient } from '@/lib/supabase/server';
import { DBEvent } from '@/components/EventCard'; // Ensure correct path if moved

/**
 * Fetches upcoming events from Supabase
 */
export async function getUpcomingEvents(): Promise<DBEvent[]> {
  const now = new Date().toISOString();
  try {
    const supabase = createServerComponentClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', now)
      .eq('is_published', true)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming events:', error); // Keep error log
      return []; // Return empty array on error
    }
    return (data as DBEvent[]) || [];
  } catch (error) {
    console.error('Unexpected error in getUpcomingEvents:', error);
    return [];
  }
}

/**
 * Fetches live events that are currently happening
 */
export async function getLiveEvents(): Promise<DBEvent[]> {
  const now = new Date().toISOString();
  try {
    const supabase = createServerComponentClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lte('start_date', now)
      .gte('end_date', now)
      .eq('is_published', true)
      .order('start_date', { ascending: true }); // Added order

    if (error) {
      console.error('Error fetching live events:', error); // Keep error log
      return []; // Return empty array on error
    }
    return (data as DBEvent[]) || [];
  } catch (error) {
    console.error('Unexpected error in getLiveEvents:', error);
    return [];
  }
}

/**
 * Fetches past events
 */
export async function getPastEvents(): Promise<DBEvent[]> {
  const now = new Date().toISOString();
  try {
    const supabase = createServerComponentClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lt('end_date', now)
      .eq('is_published', true)
      .order('start_date', { ascending: false }); // Added order

    if (error) {
      console.error('Error fetching past events:', error); // Keep error log
      return []; // Return empty array on error
    }
    return (data as DBEvent[]) || [];
  } catch (error) {
    console.error('Unexpected error in getPastEvents:', error);
    return [];
  }
}

/**
 * Fetches hackathon events by type
 */
export async function getHackathonEvents(type: 'upcoming' | 'live' | 'past'): Promise<DBEvent[]> {
  const now = new Date().toISOString();
  try {
    const supabase = createServerComponentClient();
    let query = supabase
      .from('events')
      .select('*')
      .eq('event_type', 'hackathon')
      .eq('is_published', true); // Ensure hackathons are also published

    if (type === 'upcoming') {
      query = query.gte('start_date', now).order('start_date', { ascending: true });
    } else if (type === 'live') {
      query = query.lte('start_date', now).gte('end_date', now).order('start_date', { ascending: true });
    } else {
      query = query.lt('end_date', now).order('start_date', { ascending: false }); // Changed to lt
    }
    const { data, error } = await query;
    if (error) {
      console.error(`Error fetching ${type} hackathon events:`, error);
      return []; // Return empty array on error
    }
    return (data as DBEvent[]) || [];
  } catch (error) {
    console.error(`Unexpected error in getHackathonEvents (${type}):`, error);
    return [];
  }
}

/**
 * Fetches a single event by ID
 */
export async function getEventById(id: string): Promise<DBEvent | null> {
  try {
    const supabase = createServerComponentClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error
      console.error(`Error fetching event by ID (${id}):`, error);
      return null;
    }
    return data as DBEvent | null;
  } catch (error) {
    console.error(`Unexpected error in getEventById (${id}):`, error);
    return null;
  }
}

/**
 * Fetches featured events (either live or upcoming soon)
 */
export async function getFeaturedEvents(limit: number = 3): Promise<DBEvent[]> {
  const supabase = createServerComponentClient();
  const now = new Date().toISOString();
  let featuredEvents: DBEvent[] = [];

  try {
    // First try to get live events
    const { data: liveEvents, error: liveError } = await supabase
      .from('events')
      .select('*')
      .lte('start_date', now)
      .gte('end_date', now)
      .eq('is_published', true)
      .order('start_date', { ascending: true }) // Added order
      .limit(limit);

    if (liveError) {
      console.error('Error fetching live events for featured section:', liveError);
      // Don't return here, try fetching upcoming ones
    } else if (liveEvents) {
      featuredEvents = liveEvents as DBEvent[];
    }

    // If we don't have enough live events, get upcoming events to fill the remaining slots
    if (featuredEvents.length < limit) {
      const remainingSlots = limit - featuredEvents.length;
      const { data: upcomingEvents, error: upcomingError } = await supabase
        .from('events')
        .select('*')
        .gt('start_date', now)
        .eq('is_published', true)
        .order('start_date', { ascending: true })
        .limit(remainingSlots);

      if (upcomingError) {
        console.error('Error fetching upcoming events for featured section:', upcomingError);
        // Return whatever live events we might have found
      } else if (upcomingEvents) {
        featuredEvents = [...featuredEvents, ...(upcomingEvents as DBEvent[])];
      }
    }
  } catch (error) {
    console.error('Unexpected error in getFeaturedEvents:', error);
  }
  return featuredEvents;
}