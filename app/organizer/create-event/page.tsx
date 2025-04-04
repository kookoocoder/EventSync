"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { MainNav } from "@/components/main-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function CreateEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [hasRegistrationFee, setHasRegistrationFee] = useState(false)

  // Mock user data
  const user = {
    name: "John Organizer",
    avatar: "/placeholder.svg?height=200&width=200",
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate form submission - in a real app, this would be an API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/organizer/dashboard")
    }, 1500)
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
                    <AvatarFallback>JO</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/organizer/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/organizer/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/organizer/settings">Settings</Link>
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
              <h1 className="text-3xl font-bold tracking-tight">Create New Hackathon</h1>
              <Link href="/organizer/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="prizes">Prizes & Rules</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input id="title" placeholder="e.g., AI Innovation Hackathon 2025" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your hackathon and what participants can expect"
                        className="min-h-32"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="banner">Event Banner</Label>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="banner-upload"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SVG, PNG, JPG or GIF (Recommended: 1200×630px)
                            </p>
                          </div>
                          <Input id="banner-upload" type="file" className="hidden" accept="image/*" />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Event Type</Label>
                      <RadioGroup defaultValue="online" className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="online" id="online" />
                          <Label htmlFor="online" className="font-normal">
                            Online - Virtual hackathon
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="offline" id="offline" />
                          <Label htmlFor="offline" className="font-normal">
                            Offline - In-person hackathon
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hybrid" id="hybrid" />
                          <Label htmlFor="hybrid" className="font-normal">
                            Hybrid - Both online and in-person
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="e.g., San Francisco, CA or Online via Zoom" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-participants">Maximum Participants</Label>
                      <Input id="max-participants" type="number" min="1" placeholder="e.g., 100" required />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="registration-fee-toggle">Registration Fee</Label>
                        <Switch
                          id="registration-fee-toggle"
                          checked={hasRegistrationFee}
                          onCheckedChange={setHasRegistrationFee}
                        />
                      </div>
                      {hasRegistrationFee && (
                        <div className="space-y-4 mt-4 p-4 rounded-lg border">
                          <div className="space-y-2">
                            <Label htmlFor="fee-amount">Registration Fee Amount ($)</Label>
                            <Input
                              id="fee-amount"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g., 25.00"
                              required={hasRegistrationFee}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="upi-id">UPI ID for Payments</Label>
                            <Input id="upi-id" placeholder="e.g., yourname@upi" required={hasRegistrationFee} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="qr-code">Payment QR Code (Optional)</Label>
                            <div className="flex items-center justify-center w-full">
                              <label
                                htmlFor="qr-code-upload"
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <QrCode className="w-8 h-8 mb-3 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG or SVG</p>
                                </div>
                                <Input id="qr-code-upload" type="file" className="hidden" accept="image/*" />
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button type="button" onClick={() => setActiveTab("details")}>
                        Next: Details
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Hackathon Theme</Label>
                      <Input id="theme" placeholder="e.g., Artificial Intelligence, Sustainability, etc." />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements">Technical Requirements</Label>
                      <Textarea
                        id="requirements"
                        placeholder="List any specific technologies, APIs, or tools that participants should use"
                        className="min-h-24"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eligibility">Eligibility Criteria</Label>
                      <Textarea
                        id="eligibility"
                        placeholder="Specify who can participate (e.g., students, professionals, age restrictions)"
                        className="min-h-24"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team-size">Team Size</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-1/2">
                          <Label htmlFor="min-team-size" className="text-xs">
                            Minimum
                          </Label>
                          <Input id="min-team-size" type="number" min="1" placeholder="e.g., 1" required />
                        </div>
                        <div className="w-1/2">
                          <Label htmlFor="max-team-size" className="text-xs">
                            Maximum
                          </Label>
                          <Input id="max-team-size" type="number" min="1" placeholder="e.g., 5" required />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                        Back
                      </Button>
                      <Button type="button" onClick={() => setActiveTab("schedule")}>
                        Next: Schedule
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="registration-start">Registration Start Date</Label>
                      <Input id="registration-start" type="date" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registration-end">Registration Deadline</Label>
                      <Input id="registration-end" type="date" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-start">Event Start Date & Time</Label>
                      <Input id="event-start" type="datetime-local" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-end">Event End Date & Time</Label>
                      <Input id="event-end" type="datetime-local" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="results-date">Results Announcement Date</Label>
                      <Input id="results-date" type="date" required />
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                        Back
                      </Button>
                      <Button type="button" onClick={() => setActiveTab("prizes")}>
                        Next: Prizes & Rules
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="prizes" className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="prizes">Prizes</Label>
                      <Textarea
                        id="prizes"
                        placeholder="Describe the prizes for winners (e.g., 1st Place: $5,000, 2nd Place: $2,500, etc.)"
                        className="min-h-24"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rules">Rules & Guidelines</Label>
                      <Textarea
                        id="rules"
                        placeholder="List all the rules and guidelines for the hackathon"
                        className="min-h-32"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="judging-criteria">Judging Criteria</Label>
                      <Textarea
                        id="judging-criteria"
                        placeholder="Explain how projects will be evaluated (e.g., Innovation: 25%, Technical Complexity: 25%, etc.)"
                        className="min-h-24"
                        required
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("schedule")}>
                        Back
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating Hackathon..." : "Create Hackathon"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// Import the missing components
import { QrCode } from "lucide-react"

