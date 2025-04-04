"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Card,
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ManageParticipantsPage() {
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  
  // Mock data - replace with actual data from Supabase
  const events = [
    { id: "1", name: "AI Hackathon 2024" },
    { id: "2", name: "Web3 Developer Conference" },
    { id: "3", name: "Mobile App Challenge" }
  ]
  
  const participants = [
    { id: "1", name: "Alex Johnson", email: "alex@example.com", team: "CodeNinjas", status: "confirmed", eventId: "1" },
    { id: "2", name: "Sarah Lee", email: "sarah@example.com", team: "ByteBusters", status: "pending", eventId: "1" },
    { id: "3", name: "Mike Chen", email: "mike@example.com", team: "TechTitans", status: "confirmed", eventId: "2" },
    { id: "4", name: "Emily Wong", email: "emily@example.com", team: "DevDragons", status: "canceled", eventId: "1" },
    { id: "5", name: "Raj Patel", email: "raj@example.com", team: "CodeNinjas", status: "confirmed", eventId: "3" }
  ]
  
  // Filter participants based on selected event and search query
  const filteredParticipants = participants.filter(participant => {
    const matchesEvent = selectedEvent ? participant.eventId === selectedEvent : true
    const matchesSearch = searchQuery 
      ? participant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.team.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    
    return matchesEvent && matchesSearch
  })
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "canceled":
        return <Badge className="bg-red-500">Canceled</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Participants</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger>
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Events</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map(participant => (
                  <TableRow key={participant.id}>
                    <TableCell>{participant.name}</TableCell>
                    <TableCell>{participant.email}</TableCell>
                    <TableCell>{participant.team}</TableCell>
                    <TableCell>{getStatusBadge(participant.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Contact</Button>
                        {participant.status === "pending" && (
                          <Button size="sm">Approve</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No participants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 