"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, Mail, Plus, Search, Trash2, UserPlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export default function TeamManagementPage({ params }) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)

  // Mock hackathon data
  const hackathon = {
    id: params.id,
    title: "AI Innovation Challenge",
    maxTeamSize: 5,
  }

  // Mock team data
  const team = {
    id: "team-123",
    name: "AI Innovators",
    description: "We're a team of developers and designers passionate about AI and machine learning.",
    members: [
      {
        id: "user-1",
        name: "Jane Participant",
        email: "jane@example.com",
        avatar: "/placeholder.svg?height=200&width=200",
        role: "Team Leader",
        skills: ["JavaScript", "React", "Python", "TensorFlow"],
      },
      {
        id: "user-2",
        name: "Alex Johnson",
        email: "alex@example.com",
        avatar: "/placeholder.svg?height=200&width=200",
        role: "Backend Developer",
        skills: ["Python", "Django", "Machine Learning"],
      },
      {
        id: "user-3",
        name: "Sam Wilson",
        email: "sam@example.com",
        avatar: "/placeholder.svg?height=200&width=200",
        role: "UI/UX Designer",
        skills: ["Figma", "UI Design", "User Research"],
      },
    ],
    pendingInvites: [
      {
        email: "mike@example.com",
        sentAt: "2025-04-01T12:00:00Z",
      },
    ],
    joinCode: "AI-INNO-123",
  }

  // Mock participant search results
  const searchResults = [
    {
      id: "user-4",
      name: "Emily Chen",
      email: "emily@example.com",
      avatar: "/placeholder.svg?height=200&width=200",
      skills: ["Data Science", "Python", "Visualization"],
    },
    {
      id: "user-5",
      name: "David Kim",
      email: "david@example.com",
      avatar: "/placeholder.svg?height=200&width=200",
      skills: ["JavaScript", "React", "Node.js"],
    },
  ]

  const handleInviteMember = (e) => {
    e.preventDefault()
    setIsInviting(true)

    // Simulate API call
    setTimeout(() => {
      setIsInviting(false)
      setInviteEmail("")
      // In a real app, you would update the team state with the new pending invite
    }, 1000)
  }

  const handleCreateTeam = (e) => {
    e.preventDefault()
    setIsCreatingTeam(true)

    // Simulate API call
    setTimeout(() => {
      setIsCreatingTeam(false)
      setShowCreateTeamDialog(false)
      // In a real app, you would redirect to the new team page
    }, 1000)
  }

  const handleCopyJoinCode = () => {
    navigator.clipboard.writeText(team.joinCode)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <MainNav />
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <span className="hidden sm:inline-block">Jane Participant</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=200&width=200" alt="Jane Participant" />
                    <AvatarFallback>JP</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/participant/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/participant/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/participant/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center">
              <Link href={`/hackathons/${params.id}`} className="mr-4">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                <p className="text-muted-foreground">{hackathon.title}</p>
              </div>
            </div>

            {team ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Team Info */}
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>Team for {hackathon.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{team.description}</p>

                      <div className="rounded-lg bg-muted p-4">
                        <div className="flex items-center justify-between">
                          <Label>Team Join Code</Label>
                          <Button variant="ghost" size="icon" onClick={handleCopyJoinCode}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy join code</span>
                          </Button>
                        </div>
                        <p className="mt-1 font-mono text-sm">{team.joinCode}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Share this code with people you want to invite to your team
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Team Size</Label>
                          <span className="text-sm">
                            {team.members.length} / {hackathon.maxTeamSize}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${(team.members.length / hackathon.maxTeamSize) * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Invite Members</CardTitle>
                      <CardDescription>Add new members to your team</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleInviteMember} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="invite-email">Email Address</Label>
                          <div className="flex gap-2">
                            <Input
                              id="invite-email"
                              type="email"
                              placeholder="teammate@example.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              required
                            />
                            <Button type="submit" disabled={isInviting}>
                              {isInviting ? "Inviting..." : "Invite"}
                            </Button>
                          </div>
                        </div>
                      </form>

                      {team.pendingInvites.length > 0 && (
                        <div className="mt-4">
                          <Label>Pending Invites</Label>
                          <div className="mt-2 space-y-2">
                            {team.pendingInvites.map((invite, index) => (
                              <div key={index} className="flex items-center justify-between rounded-md border p-2">
                                <div className="flex items-center">
                                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{invite.email}</span>
                                </div>
                                <Button variant="ghost" size="icon">
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Cancel invite</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Team Members */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Team Members</CardTitle>
                        <Tabs defaultValue="members">
                          <TabsList>
                            <TabsTrigger value="members">Members</TabsTrigger>
                            <TabsTrigger value="find">Find Members</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="members" className="w-full">
                        <TabsContent value="members" className="space-y-4">
                          {team.members.map((member) => (
                            <div key={member.id} className="flex items-start justify-between rounded-lg border p-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.avatar} alt={member.name} />
                                  <AvatarFallback>
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium">{member.name}</h3>
                                    {member.id === "user-1" && (
                                      <Badge variant="outline" className="text-xs">
                                        Team Leader
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{member.email}</p>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {member.skills.map((skill, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {member.id !== "user-1" && (
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove member</span>
                                </Button>
                              )}
                            </div>
                          ))}
                        </TabsContent>

                        <TabsContent value="find" className="space-y-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Search by name or skill..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button variant="outline">
                              <Search className="mr-2 h-4 w-4" />
                              Search
                            </Button>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            {searchResults.map((participant) => (
                              <div
                                key={participant.id}
                                className="flex items-start justify-between rounded-lg border p-4"
                              >
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={participant.avatar} alt={participant.name} />
                                    <AvatarFallback>
                                      {participant.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-medium">{participant.name}</h3>
                                    <p className="text-sm text-muted-foreground">{participant.email}</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {participant.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <Button size="sm">
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Invite
                                </Button>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">You don't have a team yet</h2>
                  <p className="mt-2 text-muted-foreground">Create a new team or join an existing one</p>
                  <div className="mt-6 flex gap-4 justify-center">
                    <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create a Team
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleCreateTeam}>
                          <DialogHeader>
                            <DialogTitle>Create a New Team</DialogTitle>
                            <DialogDescription>Create a team for {hackathon.title}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="team-name">Team Name</Label>
                              <Input
                                id="team-name"
                                placeholder="Enter your team name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="team-description">Team Description</Label>
                              <Textarea
                                id="team-description"
                                placeholder="Describe your team and what you're looking to build"
                                value={teamDescription}
                                onChange={(e) => setTeamDescription(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={isCreatingTeam}>
                              {isCreatingTeam ? "Creating..." : "Create Team"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Join a Team</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Join an Existing Team</DialogTitle>
                          <DialogDescription>Enter the team join code to join an existing team</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="join-code">Team Join Code</Label>
                            <Input id="join-code" placeholder="Enter team join code" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button>Join Team</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

