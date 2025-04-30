import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { participantId, eventId, pointsToRedeem } = body;
    
    // Validate required parameters
    if (!participantId || !eventId || !pointsToRedeem) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Validate pointsToRedeem is a positive number
    if (typeof pointsToRedeem !== 'number' || pointsToRedeem <= 0) {
      return NextResponse.json(
        { error: 'Points to redeem must be a positive number' },
        { status: 400 }
      );
    }
    
    // Call the redeem_points_for_discount function
    const { data, error } = await supabase.rpc(
      'redeem_points_for_discount',
      { 
        p_participant_id: participantId, 
        p_event_id: eventId, 
        p_points_to_redeem: pointsToRedeem 
      }
    );
    
    if (error) {
      console.error('Error redeeming points:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in blockchain redeem API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 