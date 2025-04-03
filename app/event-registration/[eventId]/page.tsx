"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  category: string
  image: string
  paymentQR?: string
}

export default function EventRegistrationPage({ params }: { params: { eventId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1) // Step 1: Information, Step 2: Payment
  
  // Registration form states
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    branch: "",
    department: "",
    address: "",
    email: "",
    mobile: ""
  })
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null)

  // Define fetchEvent as useCallback to avoid recreation on each render
  const fetchEvent = useCallback(async () => {
    console.log(`[RegistrationPage] Fetching event for ID: ${params.eventId}`);
    
    try {
      setIsLoading(true);
      setError(null);
      console.log("[RegistrationPage] isLoading set to true");
      
      // Use a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`/api/events?eventId=${params.eventId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`[RegistrationPage] API response status: ${response.status}`);
      
      if (!response.ok) {
        let errorData = { error: "Failed to fetch event" };
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("[RegistrationPage] Failed to parse error JSON:", jsonError);
        }
        console.error(`[RegistrationPage] API error: ${errorData.error}`);
        throw new Error(errorData.error || "Failed to fetch event");
      }
      
      const data = await response.json();
      console.log("[RegistrationPage] Event data received:", data);
      setEvent(data);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error("[RegistrationPage] Request timed out");
        setError("Request timed out. Please try again.");
      } else {
        console.error("[RegistrationPage] Error in fetchEvent:", error);
        setError(error instanceof Error ? error.message : "Event not found or unavailable.");
      }
    } finally {
      setIsLoading(false);
      console.log("[RegistrationPage] isLoading set to false in finally block");
    }
  }, [params.eventId]);

  // Initialize user data when session is available
  const initUserData = useCallback(() => {
    if (session?.user) {
      console.log("[RegistrationPage] Pre-filling form data for logged-in user.");
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || ""
      }));
    }
  }, [session]);

  useEffect(() => {
    console.log(`[RegistrationPage] useEffect triggered. Session status: ${status}`);
    
    // Don't fetch if we're still loading auth
    if (status === "loading") {
      console.log("[RegistrationPage] Waiting for session status to resolve...");
      return;
    }
    
    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      console.log("[RegistrationPage] User not authenticated, redirecting to login...");
      router.push(`/auth/login?callbackUrl=/event-registration/${params.eventId}`);
      return;
    }
    
    // Only fetch event if we're authenticated
    console.log("[RegistrationPage] Session status resolved. Calling fetchEvent.");
    fetchEvent();
    initUserData();
    
  }, [status, router, params.eventId, fetchEvent, initUserData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const requiredFields = ['name', 'college', 'email', 'mobile']
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following fields: ${missingFields.join(', ')}`)
      return
    }
    
    // Proceed to payment step
    setError(null)
    setStep(2)
  }

  const handlePaymentScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setPaymentScreenshot(file)
    
    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPaymentPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      setError("You must be logged in to complete registration")
      router.push(`/auth/login?callbackUrl=/event-registration/${params.eventId}`)
      return
    }
    
    if (!paymentScreenshot) {
      setError("Please upload a payment screenshot")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // In a real app, you'd upload the payment screenshot to a storage service
      // and store the URL in the registration. For this demo, we'll just store
      // the registration data.
      
      const response = await fetch("/api/event-registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: params.eventId,
          ...formData,
          paymentProof: "payment-screenshot-uploaded" // In real app, this would be the URL
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to register for event")
      }
      
      // Navigate to confirmation page
      router.push(`/event-registration/${params.eventId}/confirmation`)
    } catch (error) {
      console.error("Registration error:", error)
      setError(error instanceof Error ? error.message : "Failed to complete registration")
    } finally {
      setIsLoading(false)
    }
  }

  // Simple loading state while auth is checking
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading authentication...</span>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirecting to login...</span>
        </div>
      </div>
    )
  }

  // Loading state while fetching event data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading event data...</span>
        </div>
      </div>
    )
  }

  // Error state if event fetch failed
  if (error && !event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-zinc-900 border-none">
          <CardHeader>
            <CardTitle className="text-xl text-center text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white text-center">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button className="bg-yellow-300 hover:bg-yellow-400 text-black">
                Return Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <Link href="/" className="text-yellow-300 hover:underline mb-8 inline-block">
          &larr; Back to Events
        </Link>
        
        <Card className="w-full max-w-2xl mx-auto bg-zinc-900 border-none">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">
              {step === 1 ? "Event Registration" : "Payment Information"}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              {event?.title}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleSubmitInfo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      placeholder="Your mobile number"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="college">College Name</Label>
                    <Input
                      id="college"
                      name="college"
                      placeholder="Your college name"
                      value={formData.college}
                      onChange={handleInputChange}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      name="branch"
                      placeholder="Your branch (optional)"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="Your department (optional)"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Your address (optional)"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-900 rounded-md text-red-300 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4">
                  <Link href="/">
                    <Button type="button" variant="outline" className="border-zinc-700 text-gray-300">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" className="bg-yellow-300 hover:bg-yellow-400 text-black">
                    Continue to Payment
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="text-lg font-medium mb-2">Registration Summary</h3>
                  <div className="space-y-1 text-gray-300">
                    <p>Event: <span className="text-white">{event?.title}</span></p>
                    <p>Name: <span className="text-white">{formData.name}</span></p>
                    <p>Email: <span className="text-white">{formData.email}</span></p>
                    <p>Mobile: <span className="text-white">{formData.mobile}</span></p>
                    <p>College: <span className="text-white">{formData.college}</span></p>
                  </div>
                </div>
                
                {event?.paymentQR ? (
                  <div className="flex flex-col items-center space-y-4">
                    <h3 className="text-lg font-medium">Scan QR Code to Pay</h3>
                    <div className="bg-white p-4 rounded-md">
                      <Image 
                        src={event.paymentQR} 
                        alt="Payment QR Code" 
                        width={200} 
                        height={200} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-900/30 border border-yellow-900 rounded-md p-4 text-yellow-300 text-sm">
                    No payment QR code has been set for this event. Please contact the organizer for payment instructions.
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="text-yellow-300">Please take a screenshot of your payment confirmation and upload it below.</p>
                  
                  <div className="flex items-center space-x-4">
                    <Button 
                      type="button" 
                      onClick={() => document.getElementById('payment-screenshot')?.click()}
                      variant="outline"
                      className="border-zinc-700 text-gray-300"
                    >
                      Upload Screenshot
                    </Button>
                    <span className="text-gray-400 text-sm">
                      {paymentScreenshot ? paymentScreenshot.name : "No file chosen"}
                    </span>
                    <input
                      id="payment-screenshot"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePaymentScreenshotChange}
                    />
                  </div>
                  
                  {paymentPreview && (
                    <div className="mt-4">
                      <div className="relative w-full h-64 bg-zinc-800 rounded-md overflow-hidden">
                        <Image 
                          src={paymentPreview} 
                          alt="Payment Screenshot" 
                          fill 
                          className="object-contain" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-900 rounded-md text-red-300 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-zinc-700 text-gray-300"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-yellow-300 hover:bg-yellow-400 text-black"
                    disabled={isLoading || !paymentScreenshot}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 