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
    
    // Get transactions for the participant
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('participant_id', participantId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error fetching token transactions:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ transactions: data || [] });
  } catch (error: any) {
    console.error('Unexpected error in blockchain transactions API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 