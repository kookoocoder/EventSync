import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all blockchain blocks
    const { data: blocks, error } = await supabase
      .from('blockchain_blocks')
      .select('*')
      .order('block_number', { ascending: false });

    if (error) {
      console.error('Error fetching blockchain blocks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blockchain blocks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ blocks });
  } catch (error) {
    console.error('Server error in blocks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}