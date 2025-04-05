/**
 * This is a temporary debugging service to check Supabase connection
 */

import { createServerComponentClient } from '@/lib/supabase/server';
import { createVanillaServerClient } from '@/lib/supabase/server';

/**
 * Debug function to check if we can connect to Supabase
 * This will be called from the home page to get diagnostics
 */
export async function checkSupabaseConnection() {
  try {
    console.log('Attempting to connect to Supabase...');
    
    // First try with the standard server component client
    const supabase = createServerComponentClient();
    
    // Check connection by querying system time
    const { data: time, error: timeError } = await supabase.rpc('get_timestamp');
    
    if (timeError) {
      console.error('Error connecting to Supabase with server component client:', timeError);
      
      // Try with vanilla client as fallback
      console.log('Trying with vanilla client...');
      const vanillaClient = createVanillaServerClient();
      const { data: vanillaTime, error: vanillaError } = await vanillaClient.rpc('get_timestamp');
      
      if (vanillaError) {
        console.error('Error connecting with vanilla client:', vanillaError);
        return {
          connected: false,
          error: vanillaError.message,
          method: 'Both methods failed'
        };
      }
      
      return {
        connected: true,
        time: vanillaTime,
        method: 'Vanilla client'
      };
    }
    
    return {
      connected: true,
      time,
      method: 'Server component client'
    };
    
  } catch (error) {
    console.error('Unexpected error checking Supabase connection:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'Exception thrown'
    };
  }
}

/**
 * Check if events table exists and has the expected columns
 */
export async function checkEventsTable() {
  try {
    console.log('Checking events table...');
    
    const supabase = createServerComponentClient();
    
    // First check if we can query the events table at all
    const { data: eventCount, error: countError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      if (countError.code === 'PGRST116') {
        return {
          exists: false,
          error: 'Table events does not exist'
        };
      }
      return {
        exists: false,
        error: countError.message
      };
    }
    
    // Get the column information
    const { data: columnInfo, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'events' });
    
    if (columnsError) {
      return {
        exists: true,
        columns: [],
        error: columnsError.message
      };
    }
    
    return {
      exists: true,
      count: eventCount?.length ?? 0,
      columns: columnInfo
    };
    
  } catch (error) {
    console.error('Unexpected error checking events table:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Try to directly insert a test event to see if that works
 */
export async function insertTestEvent() {
  try {
    console.log('Attempting to insert a test event...');
    
    const supabase = createServerComponentClient();
    
    const now = new Date();
    const testEvent = {
      organizer_id: '00000000-0000-0000-0000-000000000000', // This needs to exist in the organizers table
      name: `Test Event ${now.toISOString()}`,
      description: 'This is a test event created to debug EventSync',
      start_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      end_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      location: 'Debug Location',
      registration_fee: 0,
      current_participants: 0,
      is_published: true,
      event_type: 'test',
      banner_image: '/placeholder.svg'
    };
    
    const { data, error } = await supabase
      .from('events')
      .insert(testEvent)
      .select('*')
      .single();
    
    if (error) {
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    return {
      success: true,
      event: data
    };
    
  } catch (error) {
    console.error('Unexpected error inserting test event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 