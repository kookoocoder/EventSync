import React from 'react';
import { redirect } from 'next/navigation';
import { PointsHistoryClient } from './client';
import { SiteHeader } from '@/components/SiteHeader';
import { createServerComponentClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Points History | EventSync',
  description: 'View your blockchain point history and transaction details',
};

export default async function PointsHistoryPage() {
  // Get supabase client using the correct server component function
  const supabase = await createServerComponentClient();
  
  // Get user data (changed from getSession to getUser)
  const { data: { user } } = await supabase.auth.getUser();
  
  // If not authenticated, redirect to login
  if (!user) {
    redirect('/login?returnTo=/participant/points');
  }
  
  // Get participant data
  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('id', user.id)
    .single();
  
  // If not a participant, redirect to login
  if (!participant) {
    redirect('/login?returnTo=/participant/points');
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <SiteHeader />
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PointsHistoryClient userId={user.id} />
      </main>
    </div>
  );
} 