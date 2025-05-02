"use client"

import { useState } from "react"
import { Eye, MessageSquare, Send, User, Calendar, Clock, FileText, Clipboard, CheckCircle, XCircle, AlertCircle } from "lucide-react"
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
  CardTitle,
  CardDescription,
  CardFooter 
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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

// Extended mock data with detailed registration information
interface Participant {
  id: string
  name: string
  email: string
  team: string
  status: "confirmed" | "pending" | "canceled"
  eventId: string
  registrationDate: string
  phoneNumber: string
  organization?: string
  emergencyContact?: string
  dietaryRestrictions?: string
  tshirtSize?: string
  comments?: string
  resume?: string
  responses?: { question: string; answer: string }[]
  paymentStatus?: "paid" | "pending" | "waived" | "refunded"
  paymentMethod?: string
  paymentAmount?: number
  paymentDate?: string
  feedbackFromOrganizer?: string
}

export default function ManageParticipantsPage() {
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [feedbackText, setFeedbackText] = useState<string>("")
  
  // Mock data - replace with actual data from Supabase
  const events = [
    { id: "1", name: "AI Innovation Summit 2024" },
    { id: "2", name: "Web3 Developer Conference" },
    { id: "3", name: "Mobile App Challenge" }
  ]
  
  // Extended mock participants data with more details
  const participants: Participant[] = [
    { 
      id: "1", 
      name: "Alex Johnson", 
      email: "alex@example.com", 
      team: "CodeNinjas", 
      status: "confirmed", 
      eventId: "1",
      registrationDate: "2024-02-10T14:30:00Z",
      phoneNumber: "+1 (555) 123-4567",
      organization: "Tech Solutions Inc.",
      emergencyContact: "Sarah Johnson: +1 (555) 987-6543",
      dietaryRestrictions: "Vegetarian",
      tshirtSize: "Medium",
      comments: "Excited to participate and learn from other developers!",
      responses: [
        { question: "Why do you want to participate?", answer: "To expand my AI knowledge and network with peers." },
        { question: "What skills will you bring to the event?", answer: "Frontend development expertise and experience with generative AI." }
      ],
      paymentStatus: "paid",
      paymentMethod: "Credit Card",
      paymentAmount: 50,
      paymentDate: "2024-02-10T15:45:00Z",
      feedbackFromOrganizer: "Great application, looking forward to seeing your project!"
    },
    { 
      id: "2", 
      name: "Sarah Lee", 
      email: "sarah@example.com", 
      team: "ByteBusters", 
      status: "pending", 
      eventId: "1",
      registrationDate: "2024-02-15T10:20:00Z",
      phoneNumber: "+1 (555) 234-5678",
      organization: "Data Analytics Pro",
      tshirtSize: "Small",
      responses: [
        { question: "Why do you want to participate?", answer: "To challenge myself with new AI problems." },
        { question: "What skills will you bring to the event?", answer: "Data science and ML expertise." }
      ],
      paymentStatus: "pending",
      paymentAmount: 50
    },
    { 
      id: "3", 
      name: "Mike Chen", 
      email: "mike@example.com", 
      team: "TechTitans", 
      status: "confirmed", 
      eventId: "2",
      registrationDate: "2024-01-20T09:15:00Z",
      phoneNumber: "+1 (555) 345-6789",
      organization: "Web Innovations LLC",
      dietaryRestrictions: "None",
      tshirtSize: "Large",
      paymentStatus: "waived",
      feedbackFromOrganizer: "Student scholarship recipient. Promising application with innovative ideas."
    },
    { 
      id: "4", 
      name: "Emily Wong", 
      email: "emily@example.com", 
      team: "DevDragons", 
      status: "canceled", 
      eventId: "1",
      registrationDate: "2024-02-05T16:45:00Z",
      phoneNumber: "+1 (555) 456-7890",
      organization: "Startup Incubator",
      tshirtSize: "Medium",
      paymentStatus: "refunded",
      paymentMethod: "PayPal",
      paymentAmount: 50,
      paymentDate: "2024-02-05T17:30:00Z",
      feedbackFromOrganizer: "Canceled due to scheduling conflict. Refund processed on Feb 10."
    },
    { 
      id: "5", 
      name: "Raj Patel", 
      email: "raj@example.com", 
      team: "CodeNinjas", 
      status: "confirmed", 
      eventId: "3",
      registrationDate: "2024-03-01T11:30:00Z",
      phoneNumber: "+1 (555) 567-8901",
      organization: "Mobile Solutions",
      dietaryRestrictions: "Gluten-free",
      tshirtSize: "Large",
      comments: "Looking forward to networking with mobile developers!",
      paymentStatus: "paid",
      paymentMethod: "Bank Transfer",
      paymentAmount: 75,
      paymentDate: "2024-03-02T09:15:00Z"
    }
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

  const getPaymentBadge = (status?: string) => {
    switch(status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Payment Pending</Badge>
      case "waived":
        return <Badge className="bg-blue-500">Fee Waived</Badge>
      case "refunded":
        return <Badge className="bg-purple-500">Refunded</Badge>
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>
    }
  }

  // Handle opening participant details
  const handleViewParticipant = (participant: Participant) => {
    setSelectedParticipant(participant)
    setFeedbackText(participant.feedbackFromOrganizer || "")
  }

  // Handle saving feedback
  const handleSaveFeedback = () => {
    if (selectedParticipant) {
      // In a real app, you would save this to the database
      console.log(`Saving feedback for ${selectedParticipant.name}: ${feedbackText}`)
      
      // Update the local state for demo purposes
      const updatedParticipants = participants.map(p => 
        p.id === selectedParticipant.id 
          ? { ...p, feedbackFromOrganizer: feedbackText } 
          : p
      )
      
      // In real implementation, you'd update state from the database response
      setSelectedParticipant({...selectedParticipant, feedbackFromOrganizer: feedbackText})
    }
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
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
                        <Dialog onOpenChange={(open) => {
                          if (open) handleViewParticipant(participant);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl h-auto max-h-[80vh] overflow-y-auto my-6">
                            <DialogHeader>
                              <DialogTitle className="text-xl flex items-center gap-2">
                                <User className="h-5 w-5" /> 
                                Participant Details: {participant.name}
                              </DialogTitle>
                              <DialogDescription>
                                Registration details and feedback for this participant
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                              {/* Basic Information Card */}
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Name:</span>
                                    <span className="font-medium">{selectedParticipant?.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="font-medium">{selectedParticipant?.email}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="font-medium">{selectedParticipant?.phoneNumber}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Organization:</span>
                                    <span className="font-medium">{selectedParticipant?.organization || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Emergency Contact:</span>
                                    <span className="font-medium">{selectedParticipant?.emergencyContact || "N/A"}</span>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Registration Information Card */}
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">Registration Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Team:</span>
                                    <span className="font-medium">{selectedParticipant?.team}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span>{getStatusBadge(selectedParticipant?.status || "")}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Registration Date:</span>
                                    <span className="font-medium">{formatDate(selectedParticipant?.registrationDate)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">T-Shirt Size:</span>
                                    <span className="font-medium">{selectedParticipant?.tshirtSize || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Dietary Restrictions:</span>
                                    <span className="font-medium">{selectedParticipant?.dietaryRestrictions || "None"}</span>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Payment Information Card */}
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">Payment Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Status:</span>
                                    <span>{getPaymentBadge(selectedParticipant?.paymentStatus)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">
                                      {selectedParticipant?.paymentAmount 
                                        ? `$${selectedParticipant.paymentAmount.toFixed(2)}` 
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Method:</span>
                                    <span className="font-medium">{selectedParticipant?.paymentMethod || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Date:</span>
                                    <span className="font-medium">{formatDate(selectedParticipant?.paymentDate)}</span>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Additional Information Card */}
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <span className="text-muted-foreground">Participant Comment:</span>
                                    <p className="mt-1 p-2 bg-muted rounded-md">
                                      {selectedParticipant?.comments || "No comments provided"}
                                    </p>
                                  </div>
                                  
                                  {selectedParticipant?.resume && (
                                    <div className="mt-2">
                                      <span className="text-muted-foreground">Resume:</span>
                                      <div className="mt-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                          <FileText className="h-4 w-4 mr-1" /> View Resume
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>

                            {/* Application Questions & Responses */}
                            {selectedParticipant?.responses && selectedParticipant.responses.length > 0 && (
                              <Card className="mt-4">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">Application Questions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  {selectedParticipant.responses.map((response, index) => (
                                    <div key={index} className="space-y-1">
                                      <p className="font-medium">{response.question}</p>
                                      <p className="text-muted-foreground p-2 bg-muted rounded-md">{response.answer}</p>
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>
                            )}

                            {/* Organizer Feedback Section */}
                            <Card className="mt-4">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <MessageSquare className="h-5 w-5" /> 
                                  Organizer Feedback
                                </CardTitle>
                                <CardDescription>
                                  Add notes or feedback about this participant that are only visible to organizers
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Label htmlFor="feedback">Feedback/Notes</Label>
                                <Textarea 
                                  id="feedback" 
                                  className="min-h-32 mt-2"
                                  placeholder="Add your notes about this participant here..."
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                />
                              </CardContent>
                              <CardFooter className="flex justify-end">
                                <Button onClick={handleSaveFeedback}>
                                  <Send className="h-4 w-4 mr-1" /> Save Feedback
                                </Button>
                              </CardFooter>
                            </Card>
                            
                            <DialogFooter className="mt-6">
                              <div className="flex gap-2">
                                {selectedParticipant?.status === "pending" && (
                                  <>
                                    <Button className="flex-1">
                                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                    </Button>
                                    <Button variant="destructive" className="flex-1">
                                      <XCircle className="h-4 w-4 mr-1" /> Reject
                                    </Button>
                                  </>
                                )}
                                {selectedParticipant?.status === "confirmed" && (
                                  <Button variant="outline" className="flex-1">
                                    <Send className="h-4 w-4 mr-1" /> Send Email
                                  </Button>
                                )}
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" /> Contact
                        </Button>
                        {participant.status === "pending" && (
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
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