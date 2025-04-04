"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function EventDashboardPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params.eventId

  // Mock data - replace with Supabase data
  const eventData = {
    id: eventId,
    name: "AI Hackathon 2024",
    description: "A global hackathon for AI enthusiasts to build innovative solutions.",
    startDate: "2024-06-15",
    endDate: "2024-06-16",
    location: "Online",
    registrationFee: 0,
    maxParticipants: 200,
    currentParticipants: 75,
    registrationEndDate: "2024-06-10",
    isPublished: true,
    prizeMoney: "$5000",
    bannerImage: "https://placehold.co/600x200",
    organizer: "Tech Innovation Labs"
  }

  const teamStats = [
    { status: "Registered", count: 18 },
    { status: "Completed", count: 12 },
    { status: "Dropped", count: 3 }
  ]

  const recentRegistrations = [
    { id: "1", name: "Sarah Team", members: 4, registeredOn: "2024-05-01", status: "confirmed" },
    { id: "2", name: "Code Crafters", members: 3, registeredOn: "2024-05-02", status: "pending" },
    { id: "3", name: "Data Wizards", members: 5, registeredOn: "2024-05-03", status: "confirmed" }
  ]

  // Form state
  const [eventForm, setEventForm] = useState(eventData)

  const handleFormChange = (field: string, value: any) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveChanges = () => {
    // Save changes to Supabase
    console.log("Saving event changes:", eventForm)
    alert("Event updated successfully!")
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Event Dashboard: {eventData.name}</h1>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Participants</CardTitle>
            <CardDescription>Current registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{eventData.currentParticipants} / {eventData.maxParticipants}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {Math.round((eventData.currentParticipants / eventData.maxParticipants) * 100)}% capacity
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Status</CardTitle>
            <CardDescription>Event visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={eventForm.isPublished}
                onCheckedChange={(checked) => handleFormChange("isPublished", checked)}
              />
              <Label>
                {eventForm.isPublished ? "Published" : "Draft"}
              </Label>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {eventForm.isPublished 
                ? "Event is visible to participants" 
                : "Event is hidden from participants"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Teams</CardTitle>
            <CardDescription>Team statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {teamStats.map(stat => (
                <div key={stat.status} className="text-center">
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <div className="text-xs text-muted-foreground">{stat.status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input 
                    id="event-name" 
                    value={eventForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input 
                    id="organizer" 
                    value={eventForm.organizer}
                    onChange={(e) => handleFormChange("organizer", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input 
                    id="start-date" 
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) => handleFormChange("startDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input 
                    id="end-date" 
                    type="date"
                    value={eventForm.endDate}
                    onChange={(e) => handleFormChange("endDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={eventForm.location}
                    onChange={(e) => handleFormChange("location", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-participants">Maximum Participants</Label>
                  <Input 
                    id="max-participants" 
                    type="number"
                    value={eventForm.maxParticipants}
                    onChange={(e) => handleFormChange("maxParticipants", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration-fee">Registration Fee</Label>
                  <Input 
                    id="registration-fee" 
                    type="number"
                    value={eventForm.registrationFee}
                    onChange={(e) => handleFormChange("registrationFee", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prize-money">Prize Money</Label>
                  <Input 
                    id="prize-money" 
                    value={eventForm.prizeMoney}
                    onChange={(e) => handleFormChange("prizeMoney", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  rows={6}
                  value={eventForm.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRegistrations.map(registration => (
                    <TableRow key={registration.id}>
                      <TableCell>{registration.name}</TableCell>
                      <TableCell>{registration.members}</TableCell>
                      <TableCell>{registration.registeredOn}</TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          {registration.status === "pending" && (
                            <Button size="sm">Approve</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-center">
                <Button variant="outline">View All Participants</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No submissions yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 