"use client"

import Link from "next/link"
import { Calendar, Clock, Code, ExternalLink, MapPin, MoreHorizontal, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"

export default function ParticipantDashboard() {
  // Mock data for participant's hackathons
  const registeredHackathons = [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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

  // Stats for the dashboard
  const stats = [
    {
      title: "Hackathons Joined",
      value: "3",
      icon: Calendar,
    },
    {
      title: "Upcoming Events",
      value: "2",
      icon: Clock,
    },
    {
      title: "Team Members",
      value: "7",
      icon: Users,
    },
    {
      title: "Projects Built",
      value: "4",
      icon: Code,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <MainNav />
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <span className="hidden sm:inline-block">Jane Participant</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    JP
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Participant Dashboard</h1>
              <Link href="/hackathons">
                <Button>Find Hackathons</Button>
              </Link>
            </div>

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

            <Tabs defaultValue="registered" className="w-full">
              <TabsList>
                <TabsTrigger value="registered">Registered Hackathons</TabsTrigger>
                <TabsTrigger value="completed">Completed Hackathons</TabsTrigger>
              </TabsList>
              <TabsContent value="registered" className="space-y-4 pt-4">
                {registeredHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </TabsContent>
              <TabsContent value="completed" className="space-y-4 pt-4">
                {completedHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} isCompleted />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

function HackathonCard({ hackathon, isCompleted = false }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 lg:w-1/5">
          <img
            src={hackathon.image || "/placeholder.svg"}
            alt={hackathon.title}
            className="h-full w-full object-cover aspect-video md:aspect-square"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{hackathon.title}</CardTitle>
                <CardDescription className="mt-1">{hackathon.description}</CardDescription>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <ExternalLink className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    {!isCompleted && (
                      <DropdownMenuItem className="text-destructive">Withdraw Registration</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{hackathon.date}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{hackathon.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <div
                  className={`mr-2 h-2 w-2 rounded-full ${
                    hackathon.status === "Registered"
                      ? "bg-green-500"
                      : hackathon.status === "Pending Approval"
                        ? "bg-amber-500"
                        : "bg-muted"
                  }`}
                />
                <span>{hackathon.status}</span>
              </div>
            </div>

            {hackathon.teamName && (
              <div className="mt-4 rounded-lg bg-primary/10 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Team: {hackathon.teamName}</p>
                    <p className="text-xs text-muted-foreground">{hackathon.teamMembers} members</p>
                  </div>
                  {isCompleted && hackathon.result && (
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      {hackathon.result}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {isCompleted ? (
              <Link href={`/hackathons/${hackathon.id}/project`}>
                <Button variant="outline" size="sm">
                  View Project
                </Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                {hackathon.teamName ? (
                  <Link href={`/hackathons/${hackathon.id}/team`}>
                    <Button variant="outline" size="sm">
                      <Users className="mr-2 h-4 w-4" /> Manage Team
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/hackathons/${hackathon.id}/join-team`}>
                    <Button variant="outline" size="sm">
                      <Users className="mr-2 h-4 w-4" /> Join/Create Team
                    </Button>
                  </Link>
                )}
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

