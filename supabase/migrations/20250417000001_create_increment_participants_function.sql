-- Migration: 20250417000001_create_increment_participants_function.sql
-- Created: 2025-04-17
-- Description: Creates a function to safely increment the current_participants count for events

-- Create a function to atomically increment the current_participants count
create or replace function increment_event_participants(event_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Update event's current participants count
  update public.events 
  set current_participants = coalesce(current_participants, 0) + 1
  where id = event_id;
end;
$$;

-- Comment on the function to explain its purpose
comment on function increment_event_participants(uuid) is 'Increments the current participants count for an event by 1. Used when a new registration is created.';

-- Grant permission to authenticated users to execute the function
grant execute on function increment_event_participants(uuid) to authenticated; 