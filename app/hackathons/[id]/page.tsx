// EventSync/app/hackathons/[id]/page.tsx (UI Updated based on Details Page Style Example)
"use client"; // This page uses client-side hooks (useParams)

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Trophy, Users, Clock, DollarSign, Code, GraduationCap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader"; 

export default function EventDetailsPage() {
    const params = useParams<{ id: string }>();
    const eventId = params.id;

    // --- Mock data (Keep existing logic structure) ---
    // In a real app, fetch this based on eventId using useEffect or server component logic passed down
    const eventData = {
        id: eventId,
        name: "AI Hackathon 2024",
        description: "A global hackathon for AI enthusiasts to build innovative solutions. Join us for an exciting weekend of coding, collaboration, and innovation. Participants will work in teams to develop AI-powered applications that solve real-world problems. Mentors from leading tech companies will be available to provide guidance throughout the event.",
        bannerImage: "/placeholder.svg?height=400&width=1200", // Using bannerImage field from example
        startDate: "2024-06-15",
        endDate: "2024-06-16",
        date: "Jun 15-17, 2024", // Keeping pre-formatted date from example for display
        location: "Online",
        registrationFee: 0, // Added from original logic
        participants: { // Matching example structure
            registered: 75,
            maxCapacity: 200,
        },
        registrationDeadline: "Jun 10, 2024", // Using example format
        organizer: "Tech Innovation Labs",
        rules: [
            "Teams can have 1-5 members",
            "All code must be written during the hackathon",
            "Participants can use any programming language or framework",
            "Projects must be submitted before the deadline",
            "Submissions will be judged based on innovation, technical difficulty, and design",
            "Adhere to the Code of Conduct."
        ],
        schedule: [ // Using schedule from example
            { date: "June 15, 2024", time: "10:00 AM - 12:00 PM", event: "Opening Ceremony & Team Formation" },
            { date: "June 15, 2024", time: "12:00 PM", event: "Hacking Begins" },
            { date: "June 16, 2024", time: "2:00 PM - 4:00 PM", event: "Mentor Sessions" },
            { date: "June 17, 2024", time: "12:00 PM", event: "Hacking Ends & Submission Deadline" },
            { date: "June 17, 2024", time: "2:00 PM - 5:00 PM", event: "Project Presentations & Judging" },
            { date: "June 17, 2024", time: "6:00 PM - 7:00 PM", event: "Awards Ceremony" },
        ],
        prizes: [ // Using prizes from example
            { place: "1st Place", amount: "$10,000", description: "Cash prize plus mentorship opportunities" },
            { place: "2nd Place", amount: "$5,000", description: "Cash prize plus cloud credits" },
            { place: "3rd Place", amount: "$2,500", description: "Cash prize plus software licenses" },
        ],
        judging: [ // Added from example
            { criteria: "Innovation & Creativity", weight: "30%", description: "Originality of the idea and creative problem-solving" },
            { criteria: "Technical Implementation", weight: "25%", description: "Quality of code, architecture, and technical complexity" },
            { criteria: "Impact & Practicality", weight: "20%", description: "Potential real-world impact and practical application" },
            { criteria: "User Experience", weight: "15%", description: "Design, usability, and overall user experience" },
            { criteria: "Presentation", weight: "10%", description: "Quality of demo, pitch, and documentation" },
        ],
        sponsors: ["TechCorp", "AI Solutions", "CloudScale", "DevTools Inc."], // Added from example
        // Requirements section data (added based on example sidebar)
        requirements: {
            skills: "Basic programming knowledge required",
            teamSize: "1-5 members per team",
            eligibility: "Open to all skill levels"
        }
    };
    // --- End Mock Data ---

    const registrationPercentage = Math.round(
        (eventData.participants.registered / eventData.participants.maxCapacity) * 100
    );

    return (
        <div className="flex min-h-screen flex-col">
                    <SiteHeader />

            <main className="flex-1">
                {/* Hero Banner - Styling from example */}
                <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <Image // Using next/image
                        src={eventData.bannerImage || "/placeholder.svg"}
                        alt={eventData.name}
                        fill
                        priority // Prioritize loading the banner
                        className="w-full h-full object-cover"
                        sizes="100vw" // Simple sizes prop for full width banner
                    />
                    <div className="absolute bottom-0 left-0 right-0 z-20 container py-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{eventData.name}</h1>
                            {/* Info line matching example */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/90">
                                <div className="flex items-center">
                                    <Calendar className="mr-1.5 h-4 w-4" />
                                    <span>{eventData.date}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="mr-1.5 h-4 w-4" />
                                    <span>{eventData.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <Users className="mr-1.5 h-4 w-4" />
                                    <span>
                                        {eventData.participants.registered} / {eventData.participants.maxCapacity} participants
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="mr-1.5 h-4 w-4" />
                                    <span>Registration closes: {eventData.registrationDeadline}</span>
                                </div>
                                <div className="flex items-center">
                                    <DollarSign className="mr-1.5 h-4 w-4" />
                                    <span>{eventData.registrationFee === 0 ? 'Free Entry' : `$${eventData.registrationFee} Fee`}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="container py-8">
                    <div className="flex flex-col gap-8 md:gap-12"> {/* Increased gap */}
                        <div className="flex flex-col md:flex-row gap-8 md:gap-12"> {/* Use flex for layout */}

                            {/* Main Content Column (Left) */}
                            <div className="flex-1 space-y-8">
                                {/* About Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About This Hackathon</CardTitle>
                                        <CardDescription>Organized by {eventData.organizer}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Using standard p tag, prose can be added if markdown is used */}
                                        <p className="text-foreground/90 leading-relaxed">{eventData.description}</p>
                                    </CardContent>
                                </Card>

                                {/* Tabs Section */}
                                <Tabs defaultValue="schedule" className="w-full">
                                     <TabsList className="grid w-full grid-cols-4 mb-4"> {/* Added mb-4 */}
                                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                                        <TabsTrigger value="prizes">Prizes</TabsTrigger>
                                        <TabsTrigger value="rules">Rules</TabsTrigger>
                                        <TabsTrigger value="judging">Judging</TabsTrigger>
                                    </TabsList>

                                    {/* Schedule Tab */}
                                    <TabsContent value="schedule" className="mt-0"> {/* Remove space-y, add mt-0 */}
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    {eventData.schedule.map((item, index) => (
                                                         <div key={index} className="flex border-l-2 border-primary pl-4 pb-4 last:pb-0 relative">
                                                            <div className="absolute -left-[0.4375rem] top-0 h-3 w-3 rounded-full bg-primary ring-4 ring-background" /> {/* Improved marker */}
                                                            <div className="flex-1 ml-2"> {/* Added margin */}
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                                                                    <h3 className="font-medium">{item.event}</h3>
                                                                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                                                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                                                        <span>{item.date}</span>
                                                                        <Clock className="ml-3 mr-1.5 h-3.5 w-3.5" />
                                                                        <span>{item.time}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Prizes Tab */}
                                     <TabsContent value="prizes" className="mt-0">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                    {eventData.prizes.map((prize, index) => (
                                                        <div
                                                            key={index}
                                                            className={`rounded-lg p-4 sm:p-6 ${ // Added padding
                                                                index === 0
                                                                ? "bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/40"
                                                                : index === 1
                                                                    ? "bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700/60"
                                                                    : index === 2
                                                                    ? "bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-700/40"
                                                                    : "bg-muted/50 border" // Fallback style
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3 sm:gap-4">
                                                                <div
                                                                    className={`flex-shrink-0 rounded-full p-2 ${
                                                                        index === 0
                                                                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
                                                                        : index === 1
                                                                            ? "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400"
                                                                            : index === 2
                                                                            ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                                                                            : "bg-muted"
                                                                    }`}
                                                                >
                                                                    <Trophy className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-semibold">{prize.place}</h3>
                                                                    <p className="text-xl sm:text-2xl font-bold">{prize.amount}</p>
                                                                </div>
                                                            </div>
                                                            <p className="mt-2 text-sm text-muted-foreground">{prize.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Rules Tab */}
                                    <TabsContent value="rules" className="mt-0">
                                        <Card>
                                            <CardContent className="pt-6">
                                                {/* Styling list like example */}
                                                <ul className="space-y-3 text-foreground/90">
                                                    {eventData.rules.map((rule, index) => (
                                                        <li key={index} className="flex items-start gap-3">
                                                            <div className="mt-1 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                                            <span>{rule}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                     {/* Judging Tab */}
                                     <TabsContent value="judging" className="mt-0">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    {eventData.judging.map((criteria, index) => (
                                                        <div
                                                            key={index}
                                                            // Styling like example
                                                            className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pb-4 border-b last:border-0 last:pb-0"
                                                        >
                                                            <div className="sm:w-1/3 flex-shrink-0">
                                                                <h3 className="font-semibold">{criteria.criteria}</h3>
                                                                <p className="text-sm font-medium text-primary">{criteria.weight}</p>
                                                            </div>
                                                            <div className="sm:w-2/3 text-sm text-muted-foreground">
                                                                <p>{criteria.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Sidebar Column (Right) */}
                            <div className="w-full md:w-72 lg:w-80 space-y-6 flex-shrink-0"> {/* Adjusted width and added flex-shrink-0 */}
                                {/* Registration Card */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col gap-4">
                                            <Button asChild className="w-full" size="lg">
                                                 <Link href={`/hackathons/${eventId}/register`}>Register for Hackathon</Link>
                                            </Button>

                                            {/* Registration Deadline Info */}
                                            <div className="rounded-lg border bg-card p-4"> {/* Use border and bg-card */}
                                                <h3 className="font-semibold text-sm mb-1.5">Registration Deadline</h3>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    <span>{eventData.registrationDeadline}</span>
                                                </div>
                                            </div>

                                            {/* Participants Info */}
                                            <div className="rounded-lg border bg-card p-4">
                                                <h3 className="font-semibold text-sm mb-2">Participants</h3>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center text-sm">
                                                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        <span>{eventData.participants.registered} registered</span>
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {registrationPercentage}% full
                                                    </span>
                                                </div>
                                                {/* Progress Bar */}
                                                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-1.5 rounded-full bg-primary"
                                                        style={{ width: `${registrationPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                 {/* Requirements Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Requirements</CardTitle> {/* Slightly smaller title */}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-start gap-3"> {/* Added gap */}
                                            <Code className="mt-0.5 mr-0 h-5 w-5 text-muted-foreground flex-shrink-0" /> {/* Adjusted icon style */}
                                            <div>
                                                <h3 className="font-medium text-sm">Technical Skills</h3>
                                                <p className="text-sm text-muted-foreground">{eventData.requirements.skills}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Users className="mt-0.5 mr-0 h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <h3 className="font-medium text-sm">Team Size</h3>
                                                <p className="text-sm text-muted-foreground">{eventData.requirements.teamSize}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <GraduationCap className="mt-0.5 mr-0 h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <h3 className="font-medium text-sm">Eligibility</h3>
                                                <p className="text-sm text-muted-foreground">{eventData.requirements.eligibility}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Sponsors Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Sponsors</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-3"> {/* Adjusted gap */}
                                            {eventData.sponsors.map((sponsor, index) => (
                                                <div key={index} className="flex items-center justify-center h-14 rounded-md bg-muted p-2 border"> {/* Adjusted height and added border */}
                                                    <span className="font-medium text-xs text-center text-muted-foreground">{sponsor}</span> {/* Adjusted text style */}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                            </div>
                        </div>
                    </div>
                </div>
            </main>
             {/* Footer - Added simple footer like other pages */}
             <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} HackSync. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href="/terms" className="hover:underline underline-offset-4">Terms</Link>
                    <Link href="/privacy" className="hover:underline underline-offset-4">Privacy</Link>
                    <Link href="/contact" className="hover:underline underline-offset-4">Contact</Link>
                </div>
                </div>
            </footer>
        </div>
    );
}