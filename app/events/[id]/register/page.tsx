"use client"

import { useState, type FormEvent, type ChangeEvent, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Check, CreditCard, Info, MapPin, Upload, Users, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/SiteHeader"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { registerForEvent, type RegistrationFormData } from "./actions"
import createClient from "@/lib/supabase/client"

export default function EventRegistrationPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    fullName: "",
    email: "",
    phone: "",
    skills: "",
    experience: "some",
    motivation: "",
    teamStatus: "looking",
    teamName: "",
    teamMembers: "",
    lookingFor: "",
    transactionId: "",
  })

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", params.id)
          .single()
        
        if (error) throw error
        if (!data) throw new Error("Event not found")
        
        setEvent(data)
      } catch (err: any) {
        console.error("Error fetching event:", err)
        setError(err.message || "Failed to load event")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1)
    window.scrollTo(0, 0)
  }

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!paymentScreenshot) {
      toast({
        title: "Payment verification required",
        description: "Please upload a screenshot of your payment to continue.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)

    try {
      // Prepare complete form data with payment screenshot
      const completeFormData: RegistrationFormData = {
        ...formData as RegistrationFormData,
        paymentScreenshot: paymentScreenshot,
      }
      
      const result = await registerForEvent(params.id, completeFormData)
      
      if (!result.success) {
        throw new Error(result.error || "Registration failed")
      }
      
      toast({
        title: "Registration submitted",
        description: "Your registration has been submitted. You'll receive a confirmation email once it's approved.",
      })
      
      // Redirect to dashboard after successful registration
      router.push("/participant/dashboard")
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPaymentScreenshot(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePaymentComplete = () => {
    setPaymentComplete(true)
    handleNextStep()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
            <p>Loading event information...</p>
          </div>
        </main>
      </div>
    )
  }

  // Show error state
  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container py-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || "This event could not be found. It may have been removed or you may have followed an invalid link."}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBA"
    return format(new Date(dateString), "MMMM d, yyyy")
  }

  return (
    <div className="flex min-h-screen flex-col">
          <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center">
              <Link href={`/events/${params.id}`} className="mr-4">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Register for {event.name}</h1>
            </div>

            <div className="flex justify-between mb-8">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > 1 ? <Check className="h-4 w-4" /> : 1}
                </div>
                <span className={currentStep >= 1 ? "font-medium" : "text-muted-foreground"}>Personal Info</span>
                <Separator className="w-8 mx-2" />
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > 2 ? <Check className="h-4 w-4" /> : 2}
                </div>
                <span className={currentStep >= 2 ? "font-medium" : "text-muted-foreground"}>Team Preference</span>
                <Separator className="w-8 mx-2" />
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > 3 ? <Check className="h-4 w-4" /> : 3}
                </div>
                <span className={currentStep >= 3 ? "font-medium" : "text-muted-foreground"}>Payment</span>
                <Separator className="w-8 mx-2" />
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    currentStep >= 4 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  4
                </div>
                <span className={currentStep >= 4 ? "font-medium" : "text-muted-foreground"}>Confirmation</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Registration Form */}
              <div className="md:col-span-2">
                <Card>
                  <form onSubmit={handleSubmit}>
                    {currentStep === 1 && (
                      <>
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>
                            Tell us about yourself so we can register you for the event
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input 
                              id="fullName" 
                              placeholder="John Doe" 
                              required 
                              value={formData.fullName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="john@example.com" 
                              required 
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                              id="phone" 
                              type="tel" 
                              placeholder="+1 (555) 123-4567" 
                              required 
                              value={formData.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="skills">Skills & Expertise</Label>
                            <Textarea
                              id="skills"
                              placeholder="List your technical skills, programming languages, and areas of expertise"
                              className="min-h-24"
                              required
                              value={formData.skills}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="experience">Previous Hackathon Experience</Label>
                            <RadioGroup 
                              value={formData.experience} 
                              onValueChange={(value) => handleRadioChange("experience", value)}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="none" id="none" />
                                <Label htmlFor="none" className="font-normal">
                                  None - This is my first hackathon
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="some" id="some" />
                                <Label htmlFor="some" className="font-normal">
                                  Some - I've participated in 1-3 hackathons
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="experienced" id="experienced" />
                                <Label htmlFor="experienced" className="font-normal">
                                  Experienced - I've participated in 4+ hackathons
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="motivation">Why do you want to participate?</Label>
                            <Textarea
                              id="motivation"
                              placeholder="Tell us why you're interested in this event and what you hope to achieve"
                              className="min-h-24"
                              required
                              value={formData.motivation}
                              onChange={handleInputChange}
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Button type="button" onClick={handleNextStep}>
                            Next: Team Preference
                          </Button>
                        </CardFooter>
                      </>
                    )}

                    {currentStep === 2 && (
                      <>
                        <CardHeader>
                          <CardTitle>Team Preference</CardTitle>
                          <CardDescription>Let us know your team status for this event</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="team-status">Team Status</Label>
                            <RadioGroup 
                              value={formData.teamStatus} 
                              onValueChange={(value) => handleRadioChange("teamStatus", value)}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="have-team" id="have-team" />
                                <Label htmlFor="have-team" className="font-normal">
                                  I already have a team
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="looking" id="looking" />
                                <Label htmlFor="looking" className="font-normal">
                                  I'm looking to join a team
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="solo" id="solo" />
                                <Label htmlFor="solo" className="font-normal">
                                  I want to participate solo
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="teamName">Team Name (if you have a team)</Label>
                            <Input 
                              id="teamName" 
                              placeholder="Awesome Hackers" 
                              value={formData.teamName}
                              onChange={handleInputChange}
                              disabled={formData.teamStatus !== "have-team"}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="teamMembers">Team Members (if you have a team)</Label>
                            <Textarea
                              id="teamMembers"
                              placeholder="List the email addresses of your team members (one per line)"
                              className="min-h-24"
                              value={formData.teamMembers}
                              onChange={handleInputChange}
                              disabled={formData.teamStatus !== "have-team"}
                            />
                            <p className="text-xs text-muted-foreground">
                              Note: Each team member must register individually. Maximum team size:{" "}
                              {event.max_team_size || 4} members.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lookingFor">
                              What kind of teammates are you looking for? (if looking to join a team)
                            </Label>
                            <Textarea
                              id="lookingFor"
                              placeholder="Describe the skills or roles you're looking for in potential teammates"
                              className="min-h-24"
                              value={formData.lookingFor}
                              onChange={handleInputChange}
                              disabled={formData.teamStatus !== "looking"}
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button type="button" variant="outline" onClick={handlePreviousStep}>
                            Back
                          </Button>
                          <Button type="button" onClick={handleNextStep}>
                            Next: Payment
                          </Button>
                        </CardFooter>
                      </>
                    )}

                    {currentStep === 3 && (
                      <>
                        <CardHeader>
                          <CardTitle>Registration Payment</CardTitle>
                          <CardDescription>Complete your registration by paying the fee</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Registration Fee</AlertTitle>
                            <AlertDescription>
                              This event has a registration fee of ${event.registration_fee || 0}. Please complete the
                              payment to confirm your registration.
                            </AlertDescription>
                          </Alert>

                          <div className="rounded-lg border p-6 text-center">
                            <h3 className="text-lg font-medium mb-4">Scan QR Code to Pay</h3>
                            <div className="flex justify-center mb-4">
                              <img
                                src={event.qr_code_url || "/placeholder.svg"}
                                alt="Payment QR Code"
                                className="h-64 w-64 object-contain"
                              />
                            </div>
                            <div className="text-sm text-muted-foreground mb-4">
                              <p>UPI ID: {event.upi_id || "organizer@upi"}</p>
                              <p>Amount: ${event.registration_fee || 0}</p>
                            </div>
                            <Button type="button" variant="outline" className="w-full" onClick={handlePaymentComplete}>
                              I've Completed the Payment
                            </Button>
                          </div>
                        </CardContent>
                      </>
                    )}

                    {currentStep === 4 && (
                      <>
                        <CardHeader>
                          <CardTitle>Payment Verification</CardTitle>
                          <CardDescription>Upload a screenshot of your payment for verification</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="payment-screenshot">Payment Screenshot</Label>
                            <div className="flex items-center justify-center w-full">
                              <label
                                htmlFor="payment-screenshot-upload"
                                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                              >
                                {paymentScreenshot ? (
                                  <img
                                    src={paymentScreenshot}
                                    alt="Payment Screenshot"
                                    className="h-full w-full object-contain p-2"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground">
                                      <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG or GIF (Max 10MB)</p>
                                  </div>
                                )}
                                <Input
                                  id="payment-screenshot-upload"
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  required
                                />
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Please upload a clear screenshot of your payment confirmation. This will be reviewed by
                              the organizers.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                            <Input 
                              id="transactionId" 
                              placeholder="Enter the transaction ID if available" 
                              value={formData.transactionId}
                              onChange={handleInputChange}
                            />
                          </div>

                          <Alert className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Registration Status</AlertTitle>
                            <AlertDescription>
                              Your registration will be pending until the payment is verified by the organizers. You'll
                              receive an email once your registration is approved.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button type="button" variant="outline" onClick={handlePreviousStep}>
                            Back
                          </Button>
                          <Button type="submit" disabled={isSubmitting || !paymentScreenshot}>
                            {isSubmitting ? "Submitting..." : "Complete Registration"}
                          </Button>
                        </CardFooter>
                      </>
                    )}
                  </form>
                </Card>
              </div>

              {/* Event Info Sidebar */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video relative overflow-hidden rounded-md">
                      <img
                        src={event.banner_image || "/placeholder.svg"}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="text-xl font-bold">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">{event.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{event.location || "TBA"}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Registration Fee: ${event.registration_fee || 0}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Max Team Size: {event.max_team_size || 4}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="font-medium mb-2">Registration Deadline</h3>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(event.registration_end_date)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      If you have any questions about the registration process or the event, please contact us.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/contact">Contact Support</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

