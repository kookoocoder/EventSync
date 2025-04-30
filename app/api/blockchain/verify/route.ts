import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Get transaction hash from query params
    const hash = request.nextUrl.searchParams.get('hash');
    
    if (!hash) {
      return NextResponse.json(
        { error: 'Missing hash parameter' },
        { status: 400 }
      );
    }
    
    // Get the transaction
    const { data: transaction, error: txError } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('transaction_hash', hash)
      .single();
    
    if (txError || !transaction) {
      console.error('Error fetching transaction:', txError);
      return NextResponse.json(
        { verified: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Find the block containing this transaction
    const { data: txBlock, error: blockLinkError } = await supabase
      .from('blockchain_transaction_blocks')
      .select('block_id')
      .eq('transaction_id', transaction.id)
      .single();
    
    // Get block details if available
    let block = null;
    if (!blockLinkError && txBlock) {
      const { data: blockData, error: blockError } = await supabase
        .from('blockchain_blocks')
        .select('*')
        .eq('id', txBlock.block_id)
        .single();
      
      if (!blockError) {
        block = blockData;
      }
    }
    
    return NextResponse.json({
      verified: true,
      transaction,
      block
    });
  } catch (error: any) {
    console.error('Unexpected error in blockchain verify API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 