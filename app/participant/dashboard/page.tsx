// EventSync/app/participant/dashboard/page.tsx (Corrected Table Query)
import Link from "next/link";
import {
  Calendar,
  Clock,
  Code,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { Auth } from '@/lib/auth-server';
import { createServerComponentClient } from '@/lib/supabase/server'; // Updated path
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function ParticipantDashboardPage() {
  // Use requireAuth to ensure user is logged in and is a participant
  const user = await Auth.requireParticipant();

  const supabase = createServerComponentClient();
  let participantData: any = null; // Renamed variable for clarity
  let fetchError: string | null = null;

  try {
    console.log(`Fetching participant data for user ID: ${user.id}`);
    // Query the CORRECT 'participants' table
    const { data, error } = await supabase
      .from('participants')
      .select('name, bio, skills, avatar_url') // Fetch columns from participants table
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle() in case the row doesn't exist yet

    if (error) {
      console.error("Error fetching participant data:", error);
      // Don't throw immediately, let the UI handle missing data
      fetchError = `Failed to load participant data: ${error.message}`;
    } else {
       participantData = data;
       console.log("Participant data fetched successfully:", participantData);
    }

  } catch (err: any) {
    // Catch unexpected errors during the fetch process
    console.error("Caught unexpected error during participant data fetch:", err.message || err);
    fetchError = `An unexpected error occurred while loading profile data.`;
  }

  // --- Mock Data (Keep for now, replace later with Supabase fetch) ---
  // TODO: Replace these with actual Supabase queries based on registrations, teams, etc.
   const registeredHackathons = [
    {
      id: "1",
      title: "AI Innovation Challenge",
      description: "Build the next generation of AI-powered applications",
      image: "/placeholder.svg?height=400&width=600",
      date: "May 15-17, 2025",
      location: "Online",
      status: "Registered",
      teamName: "AI Innovators",
      teamMembers: 4,
    },
    {
      id: "2",
      title: "Web3 Hackathon",
      description: "Create decentralized applications that shape the future",
      image: "/placeholder.svg?height=400&width=600",
      date: "Jun 5-7, 2025",
      location: "San Francisco, CA",
      status: "Pending Approval",
      teamName: null,
      teamMembers: null,
    },
  ]

  const completedHackathons = [
    {
      id: "3",
      title: "Mobile App Challenge",
      description: "Design innovative mobile applications",
      image: "/placeholder.svg?height=400&width=600",
      date: "Mar 10-12, 2025",
      location: "Online",
      status: "Completed",
      teamName: "App Wizards",
      teamMembers: 3,
      result: "Honorable Mention",
    },
  ]

  const stats = [
    { title: "Hackathons Joined", value: "3", icon: Calendar },
    { title: "Upcoming Events", value: "2", icon: Clock },
    { title: "Team Members", value: "7", icon: Users }, // This might need dynamic calculation
    { title: "Projects Built", value: "4", icon: Code },
  ];
  // --- End Mock Data ---

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} /> {/* Pass user data to header */}

      <main className="flex-1">
        <div className="container py-8">
          {/* Display error prominently if fetching failed */}
          {fetchError && !participantData && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-6">
              <p>{fetchError}</p>
            </div>
          )}

          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Participant Dashboard</h1>
              <Link href="/hackathons">
                <Button>Find Hackathons</Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="mt-3">
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Hackathon Tabs */}
            <Tabs defaultValue="registered" className="w-full">
              <TabsList>
                <TabsTrigger value="registered">Registered Hackathons</TabsTrigger>
                <TabsTrigger value="completed">Completed Hackathons</TabsTrigger>
              </TabsList>
              <TabsContent value="registered" className="space-y-4 pt-4">
                {registeredHackathons.length > 0 ? (
                  registeredHackathons.map((hackathon) => (
                    <HackathonCard key={hackathon.id} hackathon={hackathon} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No registered hackathons found.</p>
                )}
              </TabsContent>
              <TabsContent value="completed" className="space-y-4 pt-4">
                {completedHackathons.length > 0 ? (
                  completedHackathons.map((hackathon) => (
                    <HackathonCard key={hackathon.id} hackathon={hackathon} isCompleted />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No completed hackathons found.</p>
                )}
              </TabsContent>
            </Tabs>

            {/* Profile Summary */}
            {participantData ? (
              <Card>
                <CardHeader><CardTitle>Profile Summary</CardTitle></CardHeader>
                <CardContent>
                  {participantData.name && <p className="mb-1"><span className="font-medium">Name:</span> {participantData.name}</p>}
                  {participantData.bio && <p className="mb-1 italic text-muted-foreground">"{participantData.bio}"</p>}
                  {participantData.skills && participantData.skills.length > 0 ? (
                    <p><span className="font-medium">Skills:</span> {participantData.skills.join(', ')}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm">No skills listed.</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/participant/profile">
                    <Button variant="outline" size="sm">View/Edit Full Profile</Button>
                  </Link>
                </CardFooter>
              </Card>
            ) : !fetchError && ( // Only show 'complete profile' if there wasn't an error fetching
                <Card>
                    <CardHeader><CardTitle>Complete Your Profile</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Finish setting up your participant profile to see your summary here.</p>
                        <p className="text-xs text-muted-foreground mt-2">(Ensure you've added details in the 'participants' table associated with your user ID).</p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/participant/profile">
                            <Button variant="default" size="sm">Go to Profile</Button>
                        </Link>
                    </CardFooter>
                 </Card>
              )
            }
          </div>
        </div>
      </main>
    </div>
  );
}

// --- ParticipantHackathon Interface ---
interface ParticipantHackathon {
  id: string;
  title: string;
  description: string;
  image?: string;
  date: string;
  location: string;
  status: string;
  teamName?: string | null;
  teamMembers?: number | string | null;
  result?: string | null;
}

// --- HackathonCard Component ---
function HackathonCard({ hackathon, isCompleted = false }: {
  hackathon: ParticipantHackathon;
  isCompleted?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 lg:w-1/5 flex-shrink-0">
          <img
            src={hackathon.image || "/placeholder.svg"}
            alt={hackathon.title}
            className="h-full w-full object-cover aspect-video md:aspect-auto" // Adjust aspect ratio
          />
        </div>
        <div className="flex flex-1 flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-2"> {/* Use items-start */}
              <div className="flex-1"> {/* Allow title/desc to wrap */}
                <CardTitle>{hackathon.title}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">{hackathon.description}</CardDescription> {/* Limit description lines */}
              </div>
              <div className="flex-shrink-0"> {/* Prevent dropdown from wrapping */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem asChild>
                       <Link href={`/hackathons/${hackathon.id}`}> {/* Link to public details page */}
                         <ExternalLink className="mr-2 h-4 w-4" /> View Details
                       </Link>
                    </DropdownMenuItem>
                    {!isCompleted && (
                       <DropdownMenuItem asChild>
                          <Link href={`/hackathons/${hackathon.id}/team`}> {/* Link to team management */}
                            <Users className="mr-2 h-4 w-4" /> Manage Team
                          </Link>
                       </DropdownMenuItem>
                    )}
                     {!isCompleted && (
                      <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => alert('Withdraw functionality not implemented yet.')}>
                         {/* Add Withdraw Logic Here */}
                        Withdraw Registration
                      </DropdownMenuItem>
                    )}
                     {isCompleted && (
                        <DropdownMenuItem asChild>
                           <Link href={`/hackathons/${hackathon.id}/project`}> {/* Link to project view */}
                              View Project
                           </Link>
                        </DropdownMenuItem>
                     )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{hackathon.date}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{hackathon.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <div
                  className={`mr-2 h-2 w-2 rounded-full flex-shrink-0 ${hackathon.status === "Registered" || hackathon.status === "Completed" ? "bg-green-500" : hackathon.status === "Pending Approval" ? "bg-amber-500" : "bg-muted"}`}/>
                <span>{hackathon.status}</span>
              </div>
            </div>

            {hackathon.teamName && (
              <div className="mt-4 rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Team: {hackathon.teamName}</p>
                    <p className="text-xs text-muted-foreground">{hackathon.teamMembers} members</p>
                  </div>
                  {isCompleted && hackathon.result && (
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-center flex-shrink-0">
                      {hackathon.result}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end mt-auto pt-4">
            {isCompleted ? (
              <Link href={`/hackathons/${hackathon.id}/project`}>
                <Button variant="outline" size="sm">
                  View Project
                </Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                 <Link href={`/hackathons/${hackathon.id}/team`}>
                    <Button variant="outline" size="sm">
                      <Users className="mr-2 h-4 w-4" /> Team Page
                    </Button>
                  </Link>
                <Link href={`/hackathons/${hackathon.id}`}>
                  <Button size="sm">View Hackathon</Button>
                </Link>
              </div>
            )}
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}