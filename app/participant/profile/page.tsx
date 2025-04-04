"use client"

import { useState } from "react"
import Link from "next/link"
import { AtSign, Calendar, Code, Edit, Github, Globe, Linkedin, MapPin, Save, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ParticipantProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Mock user data
  const user = {
    name: "Jane Participant",
    email: "jane@example.com",
    avatar: "/placeholder.svg?height=200&width=200",
    bio: "Full-stack developer passionate about AI and machine learning. I love participating in hackathons to challenge myself and meet like-minded people.",
    location: "San Francisco, CA",
    website: "https://janedev.com",
    github: "janedev",
    twitter: "janedev",
    linkedin: "jane-participant",
    skills: ["JavaScript", "React", "Node.js", "Python", "TensorFlow", "UI/UX Design"],
    interests: ["Artificial Intelligence", "Web Development", "Open Source", "Data Science"],
    hackathonsJoined: 12,
    projectsBuilt: 15,
    achievements: [
      {
        title: "1st Place",
        event: "AI Innovation Challenge 2024",
        date: "March 2024",
      },
      {
        title: "Best UI/UX",
        event: "Web3 Hackathon",
        date: "January 2024",
      },
      {
        title: "Honorable Mention",
        event: "Climate Tech Challenge",
        date: "November 2023",
      },
    ],
  }

  const handleSaveProfile = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
    }, 1000)
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
                  <span className="hidden sm:inline-block">{user.name}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
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
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <div className="flex gap-2">
                <Link href="/participant/settings">
                  <Button variant="outline">Settings</Button>
                </Link>
                {isEditing ? (
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Profile"}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                    <Edit className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Profile Sidebar */}
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xl">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      {isEditing ? (
                        <div className="mt-4 w-full">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" defaultValue={user.name} className="mt-1" />
                        </div>
                      ) : (
                        <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
                      )}

                      <div className="mt-1 flex items-center text-sm text-muted-foreground">
                        <AtSign className="mr-1 h-4 w-4" />
                        <span>{user.email}</span>
                      </div>

                      {isEditing ? (
                        <div className="mt-4 w-full">
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" defaultValue={user.location} className="mt-1" />
                        </div>
                      ) : (
                        <div className="mt-4 flex items-center text-sm">
                          <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{user.location}</span>
                        </div>
                      )}

                      <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-muted p-2">
                          <p className="text-2xl font-bold">{user.hackathonsJoined}</p>
                          <p className="text-xs text-muted-foreground">Hackathons</p>
                        </div>
                        <div className="rounded-lg bg-muted p-2">
                          <p className="text-2xl font-bold">{user.projectsBuilt}</p>
                          <p className="text-xs text-muted-foreground">Projects</p>
                        </div>
                        <div className="rounded-lg bg-muted p-2">
                          <p className="text-2xl font-bold">{user.achievements.length}</p>
                          <p className="text-xs text-muted-foreground">Awards</p>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {isEditing ? (
                        <>
                          <div className="w-full">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" defaultValue={user.website} className="mt-1" />
                          </div>
                          <div className="mt-4 w-full">
                            <Label htmlFor="github">GitHub</Label>
                            <Input id="github" defaultValue={user.github} className="mt-1" />
                          </div>
                          <div className="mt-4 w-full">
                            <Label htmlFor="twitter">Twitter</Label>
                            <Input id="twitter" defaultValue={user.twitter} className="mt-1" />
                          </div>
                          <div className="mt-4 w-full">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input id="linkedin" defaultValue={user.linkedin} className="mt-1" />
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-center gap-4">
                          {user.website && (
                            <a
                              href={user.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Globe className="h-5 w-5" />
                              <span className="sr-only">Website</span>
                            </a>
                          )}
                          {user.github && (
                            <a
                              href={`https://github.com/${user.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Github className="h-5 w-5" />
                              <span className="sr-only">GitHub</span>
                            </a>
                          )}
                          {user.twitter && (
                            <a
                              href={`https://twitter.com/${user.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Twitter className="h-5 w-5" />
                              <span className="sr-only">Twitter</span>
                            </a>
                          )}
                          {user.linkedin && (
                            <a
                              href={`https://linkedin.com/in/${user.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Linkedin className="h-5 w-5" />
                              <span className="sr-only">LinkedIn</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Profile Content */}
              <div className="md:col-span-2">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList>
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="skills">Skills & Interests</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="space-y-4 pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>About Me</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isEditing ? (
                          <Textarea
                            defaultValue={user.bio}
                            className="min-h-32"
                            placeholder="Tell others about yourself, your experience, and what you're passionate about."
                          />
                        ) : (
                          <p className="whitespace-pre-line">{user.bio}</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4 pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Skills</CardTitle>
                        <CardDescription>Technologies and tools you're proficient with</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Label htmlFor="skills">Skills (comma separated)</Label>
                            <Input
                              id="skills"
                              defaultValue={user.skills.join(", ")}
                              placeholder="JavaScript, React, Python, etc."
                            />
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill) => (
                              <div key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                                {skill}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Interests</CardTitle>
                        <CardDescription>Topics you're interested in</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Label htmlFor="interests">Interests (comma separated)</Label>
                            <Input
                              id="interests"
                              defaultValue={user.interests.join(", ")}
                              placeholder="AI, Web Development, Data Science, etc."
                            />
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {user.interests.map((interest) => (
                              <div key={interest} className="rounded-full bg-muted px-3 py-1 text-sm">
                                {interest}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="achievements" className="space-y-4 pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Achievements & Awards</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {user.achievements.map((achievement, index) => (
                            <div key={index} className="flex border-l-2 border-primary pl-4 pb-4 last:pb-0 relative">
                              <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary" />
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <h3 className="font-medium">{achievement.title}</h3>
                                    <p className="text-sm text-muted-foreground">{achievement.event}</p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <Calendar className="inline-block mr-1 h-4 w-4" />
                                    <span>{achievement.date}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {isEditing && (
                            <Button variant="outline" className="w-full mt-4">
                              <Code className="mr-2 h-4 w-4" />
                              Add Achievement
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

