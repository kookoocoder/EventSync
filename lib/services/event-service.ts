import { createServerComponentClient } from '@/lib/supabase/server';
import { DBEvent } from '@/components/EventCard';

// Wrap Supabase calls in try/catch for more robust error handling
async function safeSupabaseCall<T>(callback: (supabase: any) => Promise<T>, fallback: T): Promise<T> {
  try {
    const supabase = createServerComponentClient();
    return await callback(supabase);
  } catch (error) {
    console.error('Error in Supabase call:', error);
    return fallback;
  }
}

/**
 * Fetches upcoming events from Supabase
 */
export async function getUpcomingEvents(): Promise<DBEvent[]> {
  console.log('Fetching upcoming events');
  const now = new Date().toISOString();
  
  return safeSupabaseCall(async (supabase) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', now)
      .eq('is_published', true)
      .order('start_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching upcoming events:', error);
      return [createMockEvent('Upcoming Test Event')];
    }
    
    console.log(`Found ${data?.length || 0} upcoming events`);
    
    if (!data?.length) {
      console.log('No upcoming events found, adding mock data for debugging');
      return [createMockEvent('Upcoming Test Event')];
    }
    
    return data;
  }, [createMockEvent('Upcoming Fallback Event')]);
}

/**
 * Fetches live events that are currently happening
 */
export async function getLiveEvents(): Promise<DBEvent[]> {
  console.log('Fetching live events');
  const now = new Date().toISOString();
  
  return safeSupabaseCall(async (supabase) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lte('start_date', now)
      .gte('end_date', now)
      .eq('is_published', true)
      .order('start_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching live events:', error);
      return [createMockEvent('Live Test Event', true)];
    }
    
    console.log(`Found ${data?.length || 0} live events`);
    
    if (!data?.length) {
      console.log('No live events found, adding mock data for debugging');
      return [createMockEvent('Live Test Event', true)];
    }
    
    return data;
  }, [createMockEvent('Live Fallback Event', true)]);
}

/**
 * Fetches past events
 */
export async function getPastEvents(): Promise<DBEvent[]> {
  console.log('Fetching past events');
  const now = new Date().toISOString();
  
  return safeSupabaseCall(async (supabase) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lt('end_date', now)
      .eq('is_published', true)
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching past events:', error);
      return [createMockEvent('Past Test Event', false, true)];
    }
    
    console.log(`Found ${data?.length || 0} past events`);
    
    if (!data?.length) {
      console.log('No past events found, adding mock data for debugging');
      return [createMockEvent('Past Test Event', false, true)];
    }
    
    return data;
  }, [createMockEvent('Past Fallback Event', false, true)]);
}

/**
 * Fetches hackathon events by type
 */
export async function getHackathonEvents(type: 'upcoming' | 'live' | 'past'): Promise<DBEvent[]> {
  console.log(`Fetching ${type} hackathon events`);
  const now = new Date().toISOString();
  
  return safeSupabaseCall(async (supabase) => {
    let query = supabase
      .from('events')
      .select('*')
      .eq('event_type', 'hackathon')
      .eq('is_published', true);
    
    if (type === 'upcoming') {
      query = query.gte('start_date', now).order('start_date', { ascending: true });
    } else if (type === 'live') {
      query = query.lte('start_date', now).gte('end_date', now).order('start_date', { ascending: true });
    } else {
      query = query.lt('end_date', now).order('start_date', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${type} hackathon events:`, error);
      const isLive = type === 'live';
      const isPast = type === 'past';
      return [createMockEvent(`${type.charAt(0).toUpperCase() + type.slice(1)} Hackathon Test`, isLive, isPast, true)];
    }
    
    console.log(`Found ${data?.length || 0} ${type} hackathon events`);
    
    if (!data?.length) {
      console.log(`No ${type} hackathon events found, adding mock data for debugging`);
      const isLive = type === 'live';
      const isPast = type === 'past';
      return [createMockEvent(`${type.charAt(0).toUpperCase() + type.slice(1)} Hackathon Test`, isLive, isPast, true)];
    }
    
    return data;
  }, [createMockEvent(`${type.charAt(0).toUpperCase() + type.slice(1)} Hackathon Fallback`, type === 'live', type === 'past', true)]);
}

/**
 * Fetches a single event by ID
 */
export async function getEventById(id: string): Promise<DBEvent | null> {
  return safeSupabaseCall(async (supabase) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }
    
    return data;
  }, null);
}

/**
 * Helper function to create mock event data for debugging
 */
function createMockEvent(
  name: string, 
  isLive: boolean = false, 
  isPast: boolean = false,
  isHackathon: boolean = false
): DBEvent {
  const now = new Date();
  
  let startDate: Date;
  let endDate: Date;
  
  if (isLive) {
    // For live events, start in the past and end in the future
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
  } else if (isPast) {
    // For past events, both start and end in the past
    startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days ago
    endDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
  } else {
    // For upcoming events, both start and end in the future
    startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    endDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
  }
  
  return {
    id: `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name,
    description: `This is a mock ${isHackathon ? 'hackathon' : 'event'} created for debugging purposes`,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    location: isHackathon ? 'Online' : 'San Francisco, CA',
    registration_fee: Math.random() > 0.5 ? Math.floor(Math.random() * 50) : 0,
    max_team_size: isHackathon ? 4 : null,
    current_participants: Math.floor(Math.random() * 100) + 20,
    registration_end_date: new Date(startDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    is_published: true,
    prize_money: isHackathon ? '$5,000' : null,
    banner_image: '/placeholder.svg?height=400&width=600',
    event_type: isHackathon ? 'hackathon' : 'conference',
    min_team_size: isHackathon ? 2 : null,
    requirements: null,
    rules: null,
    registration_start_date: new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    results_announcement_date: isPast ? new Date(endDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() : null,
  };
}

/**
 * Fetches featured events (either live or upcoming soon)
 */
export async function getFeaturedEvents(limit: number = 3): Promise<DBEvent[]> {
  const supabase = createServerComponentClient();
  const now = new Date().toISOString();
  
  // First try to get live events
  const { data: liveEvents, error: liveError } = await supabase
    .from('events')
    .select('*')
    .lte('start_date', now)
    .gte('end_date', now)
    .eq('is_published', true)
    .limit(limit);
  
  if (liveError) {
    console.error('Error fetching live events for featured section:', liveError);
    return [];
  }
  
  // If we have enough live events, return them
  if (liveEvents.length >= limit) {
    return liveEvents as DBEvent[];
  }
  
  // Otherwise, get upcoming events to fill the remaining slots
  const remainingSlots = limit - liveEvents.length;
  const { data: upcomingEvents, error: upcomingError } = await supabase
    .from('events')
    .select('*')
    .gt('start_date', now)
    .eq('is_published', true)
    .order('start_date', { ascending: true })
    .limit(remainingSlots);
  
  if (upcomingError) {
    console.error('Error fetching upcoming events for featured section:', upcomingError);
    return liveEvents as DBEvent[];
  }
  
  // Combine live and upcoming events
  return [...liveEvents, ...upcomingEvents] as DBEvent[];
} 