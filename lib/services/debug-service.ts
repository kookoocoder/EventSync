// EventSync/lib/services/debug-service.ts (Modified to avoid custom RPCs)

import { createServerComponentClient } from '@/lib/supabase/server';
// Removed: import { createVanillaServerClient } from '@/lib/supabase/server'; // No longer needed for this check

/**
 * Debug function to check if we can connect to Supabase
 * This will be called from the home page to get diagnostics
 */
export async function checkSupabaseConnection() {
  try {
    console.log('Attempting to connect to Supabase using standard select...');

    const supabase = createServerComponentClient();

    // Check connection by trying a lightweight query on a known table (e.g., 'events').
    // head: true asks for only the count, not the data, making it efficient.
    const { error } = await supabase
      .from('events') // You could use any table you expect to exist
      .select('*', { count: 'exact', head: true });

    // If we get a 'relation "..." does not exist' error, the connection is likely fine,
    // but the table is missing. Other errors might indicate connection/auth issues.
    if (error && error.code !== 'PGRST116') { // PGRST116 = relation does not exist
        console.error('Error performing Supabase check query:', error);
        return {
            connected: false,
            error: `Connection/Query failed: ${error.message} (Code: ${error.code})`,
            method: 'Standard select head',
        };
    }

    // If no error OR the error was just that the 'events' table doesn't exist,
    // the connection itself is working.
    console.log('Supabase connection check successful (or table not found, which is ok for connection test).');
    return {
      connected: true,
      error: error?.code === 'PGRST116' ? 'Target table (events) not found, but connection ok.' : null,
      method: 'Standard select head',
    };

  } catch (error) {
    console.error('Unexpected error checking Supabase connection:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown exception during connection check',
      method: 'Exception thrown',
    };
  }
}

/**
 * Check if events table exists.
 * (Removed column checking via RPC)
 */
export async function checkEventsTable() {
  try {
    console.log('Checking if events table exists...');

    const supabase = createServerComponentClient();

    // Check if we can query the events table at all
    // head: true makes this very lightweight
    const { count, error: countError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      if (countError.code === 'PGRST116') { // Standard code for "relation does not exist"
        console.log('Events table does not exist.');
        return {
          exists: false,
          error: 'Table events does not exist (PGRST116)',
          columns: null // Indicate columns weren't checked
        };
      }
      // Other potential errors (permissions, connection issues)
       console.error('Error checking events table:', countError);
      return {
        exists: false, // Assume false if we can't query it for other reasons
        error: `Failed to query events table: ${countError.message}`,
        columns: null
      };
    }

    // If no error, the table exists
    console.log(`Events table exists. Reported count (head only): ${count}`); // Count will be null with head:true, but success means it exists
    return {
      exists: true,
      count: null, // Count is null with head: true
      error: null,
      columns: 'Not checked (RPC removed)' // Clarify that columns are not checked anymore
    };

  } catch (error) {
    console.error('Unexpected error checking events table:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown exception during table check',
      columns: null
    };
  }
}

/**
 * Try to directly insert a test event to see if that works
 * (This function is likely okay as is, assuming 'events' table schema matches)
 */
export async function insertTestEvent() {
  try {
    console.log('Attempting to insert a test event...');

    const supabase = createServerComponentClient(); // Use standard client

    const now = new Date();
    // --- IMPORTANT: Ensure this placeholder ID exists in your 'users' or 'organizers' table ---
    // You might need to fetch the actual authenticated user's ID here if RLS requires it.
    // For simple testing without RLS/Auth, a placeholder might work if constraints allow.
    // const { data: { user } } = await supabase.auth.getUser();
    // const organizerId = user?.id || 'YOUR_FALLBACK_TEST_ORGANIZER_UUID';
    const organizerId = '00000000-0000-0000-0000-000000000000'; // Placeholder, adjust if needed!

    const testEvent = {
      // Ensure column names match your actual 'events' table schema
      organizer_id: organizerId, // Make sure this matches the foreign key column name
      name: `Test Event ${now.toISOString()}`,
      description: 'This is a test event created to debug EventSync',
      start_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Debug Location',
      registration_fee: 0,
      // current_participants: 0, // Usually defaults or handled by triggers
      is_published: false, // Default to false for tests
      event_type: 'test', // Ensure this matches your enum/type if applicable
      banner_image: '/placeholder.svg',
      // Add any other *required* columns from your 'events' table here
      // e.g., max_participants: 100, registration_start_date: now.toISOString(), etc.
    };

    console.log("Test event data:", testEvent);

    const { data, error } = await supabase
      .from('events')
      .insert(testEvent)
      .select('*') // Select what was inserted
      .single(); // Expecting a single row back

    if (error) {
       console.error('Error inserting test event:', error);
       // Provide more detailed error if possible
      return {
        success: false,
        error: error.message,
        details: error // Include full error object for debugging
      };
    }

    console.log('Test event inserted successfully:', data);
    return {
      success: true,
      event: data
    };

  } catch (error) {
    console.error('Unexpected error inserting test event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during test insert'
    };
  }
}