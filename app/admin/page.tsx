"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Calendar, MapPin, Clock, Edit, Trash2, PlusCircle, LayoutDashboard, LogOut, Image as ImageIcon, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  category: string
  isLive: boolean
  image?: string
  paymentQR?: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [paymentQRPreview, setPaymentQRPreview] = useState<string | null>(null)
  const [paymentQRFile, setPaymentQRFile] = useState<File | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error("Failed to fetch events:", error)
        setError("Failed to load events. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (status !== "loading") {
      fetchEvents()
    }
  }, [status])

  useEffect(() => {
    // Reset image preview when editing state changes
    if (!editingEvent) {
      setImagePreview(null)
      setImageFile(null)
      setPaymentQRPreview(null)
      setPaymentQRFile(null)
    } else {
      if (editingEvent.image) {
        setImagePreview(editingEvent.image)
      }
      if (editingEvent.paymentQR) {
        setPaymentQRPreview(editingEvent.paymentQR)
      }
    }
  }, [editingEvent])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    router.push("/auth/login")
    return null
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    
    // Check if the file is too large (>1MB)
    const isLargeFile = file.size > 1024 * 1024
    
    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      
      // If the file is large, we'll create a smaller data URL to avoid performance issues
      if (isLargeFile) {
        // Create a smaller version for the preview
        const img = document.createElement('img')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Target aspect ratio 2:3 (width:height)
          const aspectRatio = 2/3
          
          // Calculate dimensions while maintaining aspect ratio
          let targetWidth, targetHeight, sourceX, sourceY, sourceWidth, sourceHeight
          
          const imgAspectRatio = img.width / img.height
          
          if (imgAspectRatio > aspectRatio) {
            // Image is wider than our target ratio
            sourceHeight = img.height
            sourceWidth = img.height * aspectRatio
            sourceX = (img.width - sourceWidth) / 2
            sourceY = 0
          } else {
            // Image is taller than our target ratio
            sourceWidth = img.width
            sourceHeight = img.width / aspectRatio
            sourceX = 0
            sourceY = (img.height - sourceHeight) / 2
          }
          
          // Set dimensions - maintain aspect ratio but limit max dimensions
          targetWidth = Math.min(600, sourceWidth)
          targetHeight = targetWidth / aspectRatio
          
          canvas.width = targetWidth
          canvas.height = targetHeight
          
          // Draw the resized and cropped image
          ctx?.drawImage(
            img, 
            sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
            0, 0, targetWidth, targetHeight // Destination rectangle
          )
          
          // Get the compressed data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
          setImagePreview(compressedDataUrl)
        }
        img.src = result
      } else {
        // For smaller files, use the original data URL
        setImagePreview(result)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleClearImage() {
    setImagePreview(null)
    setImageFile(null)
    const fileInput = document.getElementById('image') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  function handlePaymentQRChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPaymentQRFile(file)
    
    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPaymentQRPreview(result)
    }
    reader.readAsDataURL(file)
  }

  function handleClearPaymentQR() {
    setPaymentQRPreview(null)
    setPaymentQRFile(null)
    const fileInput = document.getElementById('paymentQR') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      location: formData.get("location") as string,
      category: formData.get("category") as string,
      isLive: formData.get("isLive") === "true",
      image: imagePreview || "/placeholder.svg",
      paymentQR: formData.get("paymentQR") as string,
      ...(editingEvent ? { id: editingEvent.id } : {})
    }

    // If editing, we use PUT otherwise POST
    const method = editingEvent ? "PUT" : "POST"
    const url = editingEvent 
      ? `/api/events?eventId=${editingEvent.id}` 
      : "/api/events"

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Something went wrong"
        
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If can't parse as JSON, use text directly
          errorMessage = errorText || `Failed to ${editingEvent ? 'update' : 'create'} event`
        }
        
        throw new Error(errorMessage)
      }

      // Get response data
      const responseText = await response.text()
      let responseData
      
      try {
        // Only try to parse if there's actual content
        if (responseText.trim()) {
          responseData = JSON.parse(responseText)
        } else {
          // For empty responses, create a basic object with the event ID
          responseData = editingEvent ? { ...eventData } : { id: String(events.length + 1), ...eventData }
        }
      } catch (e) {
        console.error("Error parsing response:", e)
        // If parsing fails, create a basic object with the current state
        responseData = editingEvent ? { ...eventData } : { id: String(events.length + 1), ...eventData }
      }
      
      if (editingEvent) {
        // Update existing event in state
        setEvents(events.map(evt => 
          evt.id === editingEvent.id ? responseData : evt
        ))
        setEditingEvent(null) // Exit edit mode
      } else {
        // Add new event to state
        setEvents([...events, responseData])
      }

      event.currentTarget.reset()
      setImagePreview(null)
      setImageFile(null)
    } catch (error) {
      console.error("Error during event save:", error)
      setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) {
      return
    }

    try {
      const response = await fetch(`/api/events?eventId=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      setEvents(events.filter(event => event.id !== id))
    } catch (error) {
      console.error("Error deleting event:", error)
      setError("Failed to delete event. Please try again.")
    }
  }

  function handleEditEvent(event: Event) {
    setEditingEvent(event)
    // Scroll to form
    const formElement = document.getElementById('event-form')
    formElement?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingEvent(null)
    setImagePreview(null)
    setImageFile(null)
    // Reset form
    const formElement = document.getElementById('event-form') as HTMLFormElement
    if (formElement) formElement.reset()
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Admin Header */}
      <header className="bg-zinc-900 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-yellow-400" />
            <h1 className="text-xl font-bold">EventSync Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-300">
              Logged in as <span className="text-yellow-400 font-medium">{session.user.name || session.user.email}</span>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                View Site
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-300 hover:text-white"
              onClick={() => router.push('/api/auth/signout')}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Event Form */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden sticky top-8">
              <CardHeader className="bg-zinc-800/50 border-b border-zinc-800 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  {editingEvent ? (
                    <>
                      <Edit className="w-5 h-5 text-yellow-400" />
                      Edit Event
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 text-yellow-400" />
                      Create New Event
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-200">Event Title</Label>
                    <Input
                      id="title"
                      name="title"
                      required
                      placeholder="Enter event title"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      defaultValue={editingEvent?.title || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-200">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      placeholder="Describe the event"
                      className="bg-zinc-800 border-zinc-700 text-white min-h-[100px] placeholder:text-zinc-500"
                      defaultValue={editingEvent?.description || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-gray-200">Date & Time</Label>
                    <Input
                      id="date"
                      name="date"
                      type="datetime-local"
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                      defaultValue={editingEvent ? new Date(editingEvent.date).toISOString().slice(0, 16) : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-200">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      required
                      placeholder="Event location"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      defaultValue={editingEvent?.location || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-gray-200">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      required
                      placeholder="e.g., Conference, Workshop"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      defaultValue={editingEvent?.category || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isLive" className="text-gray-200">Status</Label>
                    <select
                      id="isLive"
                      name="isLive"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white"
                      defaultValue={editingEvent?.isLive ? 'true' : 'false'}
                    >
                      <option value="false">Upcoming Event</option>
                      <option value="true">Live Now</option>
                    </select>
                  </div>
                  
                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-gray-200">Event Poster / Thumbnail</Label>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('image')?.click()}
                        className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Select Image
                      </Button>
                      {imagePreview && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          onClick={handleClearImage}
                          className="h-9 w-9 rounded-md bg-red-950 hover:bg-red-900 text-red-200 border-red-900"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-2 relative w-full h-0 pb-[150%] bg-zinc-800 rounded-md overflow-hidden">
                        <Image 
                          src={imagePreview} 
                          alt="Preview" 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Payment QR Upload Section */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentQR" className="text-gray-200">Payment QR Code</Label>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('paymentQR')?.click()}
                        className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Select Payment QR
                      </Button>
                      {paymentQRPreview && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          onClick={handleClearPaymentQR}
                          className="h-9 w-9 rounded-md bg-red-950 hover:bg-red-900 text-red-200 border-red-900"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      <input
                        id="paymentQR"
                        type="file"
                        accept="image/*"
                        onChange={handlePaymentQRChange}
                        className="hidden"
                      />
                    </div>
                    
                    {paymentQRPreview && (
                      <div className="mt-2 relative w-full h-0 pb-[150%] bg-zinc-800 rounded-md overflow-hidden">
                        <Image 
                          src={paymentQRPreview} 
                          alt="Payment QR Preview" 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                    )}
                  </div>
                  
                  {error && (
                    <div className="text-red-400 text-sm p-2 bg-red-950/50 rounded-md border border-red-900">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                    </Button>
                    
                    {editingEvent && (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-zinc-700 text-gray-300 hover:bg-zinc-800"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Event List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              Existing Events
            </h2>
            
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No events found. Create your first event.</div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className={`md:w-2 ${event.isLive ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                        
                        {/* Event Thumbnail */}
                        <div className="md:w-1/4 relative bg-zinc-800">
                          <div className="h-0 pb-[150%] relative">
                            <Image 
                              src={event.image || "/placeholder.svg"} 
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        
                        <div className="p-6 flex-grow">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold mb-3 text-white">{event.title}</h3>
                            <div className={`text-xs px-2 py-1 rounded ${event.isLive ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
                              {event.isLive ? 'LIVE' : 'UPCOMING'}
                            </div>
                          </div>
                          <p className="text-gray-300 mb-4">{event.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-yellow-400" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-yellow-400" />
                              <span>{new Date(event.date).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-yellow-400" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                              <span>{event.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 p-4 border-t border-zinc-800 bg-zinc-800/30">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-yellow-400"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="bg-red-950 hover:bg-red-900 text-red-200 border-red-900"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 