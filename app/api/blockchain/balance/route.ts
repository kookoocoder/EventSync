import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Get participant ID from query params
    const participantId = request.nextUrl.searchParams.get('participantId');
    
    if (!participantId) {
      return NextResponse.json(
        { error: 'Missing participantId parameter' },
        { status: 400 }
      );
    }
    
    // Call the blockchain edge function or fetch directly from Supabase
    const { data, error } = await supabase
      .from('token_balances')
      .select('balance')
      .eq('participant_id', participantId)
      .single();
    
    if (error) {
      console.error('Error fetching token balance:', error);
      // If no balance found, return 0 instead of error
      if (error.code === 'PGRST116') {
        return NextResponse.json({ balance: 0 });
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ balance: data?.balance || 0 });
  } catch (error: any) {
    console.error('Unexpected error in blockchain balance API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 