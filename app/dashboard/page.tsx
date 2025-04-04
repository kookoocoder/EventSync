import { createClient } from '@/utils/supabase/server' // Use server client
import { redirect } from 'next/navigation'

// Optional: Add a logout button/form
// import LogoutButton from '@/components/LogoutButton'; 

export default async function DashboardPage() {
  const supabase = createClient()

  // Check if user is logged in
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login') // Redirect to login if not authenticated
  }

  // Display user information or dashboard content
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Hello World! You are logged in.</p>
      <p className="mb-2">Welcome, {data.user.email}</p>
      
      {/* Optional: Add a Logout Button component here */}
      {/* <LogoutButton /> */}

      {/* Example: Fetch user profile data */}
      {/* 
      const { data: profile, error: profileError } = await supabase
        .from('profiles') // Assuming you have a 'profiles' table or view
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        return <p>Profile Name: {profile.name}</p>;
      }
      */}
    </div>
  )
} 