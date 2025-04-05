"use client"

import { useState, type FormEvent, type ChangeEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Check, CreditCard, Info, MapPin, Upload, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/SiteHeader"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function HackathonRegistrationPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null)

  // Mock hackathon data - in a real app, you would fetch this based on the ID
  const hackathon = {
    id: params.id,
    title: "AI Innovation Challenge",
    description: "Build the next generation of AI-powered applications",
    image: "/placeholder.svg?height=400&width=600",
    date: "May 15-17, 2025",
    location: "Online",
    registrationDeadline: "Apr 30, 2025",
    registrationFee: 25,
    upiId: "organizer@upi",
    qrCodeImage: "/placeholder.svg?height=300&width=300",
    maxTeamSize: 5,
  }

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1)
    window.scrollTo(0, 0)
  }

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission - in a real app, this would be an API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/participant/dashboard")
    }, 1500)
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

  return (
    <div className="flex min-h-screen flex-col">
          <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center">
              <Link href={`/hackathons/${params.id}`} className="mr-4">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Register for {hackathon.title}</h1>
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
                            Tell us about yourself so we can register you for the hackathon
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="John Doe" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="john@example.com" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="skills">Skills & Expertise</Label>
                            <Textarea
                              id="skills"
                              placeholder="List your technical skills, programming languages, and areas of expertise"
                              className="min-h-24"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="experience">Previous Hackathon Experience</Label>
                            <RadioGroup defaultValue="some">
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
                              placeholder="Tell us why you're interested in this hackathon and what you hope to achieve"
                              className="min-h-24"
                              required
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
                          <CardDescription>Let us know your team status for this hackathon</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="team-status">Team Status</Label>
                            <RadioGroup defaultValue="looking">
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
                            <Label htmlFor="team-name">Team Name (if you have a team)</Label>
                            <Input id="team-name" placeholder="Awesome Hackers" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="team-members">Team Members (if you have a team)</Label>
                            <Textarea
                              id="team-members"
                              placeholder="List the names and email addresses of your team members"
                              className="min-h-24"
                            />
                            <p className="text-xs text-muted-foreground">
                              Note: Each team member must register individually. Maximum team size:{" "}
                              {hackathon.maxTeamSize} members.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="looking-for">
                              What kind of teammates are you looking for? (if looking to join a team)
                            </Label>
                            <Textarea
                              id="looking-for"
                              placeholder="Describe the skills or roles you're looking for in potential teammates"
                              className="min-h-24"
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
                              This hackathon has a registration fee of ${hackathon.registrationFee}. Please complete the
                              payment to confirm your registration.
                            </AlertDescription>
                          </Alert>

                          <div className="rounded-lg border p-6 text-center">
                            <h3 className="text-lg font-medium mb-4">Scan QR Code to Pay</h3>
                            <div className="flex justify-center mb-4">
                              <img
                                src={hackathon.qrCodeImage || "/placeholder.svg"}
                                alt="Payment QR Code"
                                className="h-64 w-64 object-contain"
                              />
                            </div>
                            <div className="text-sm text-muted-foreground mb-4">
                              <p>UPI ID: {hackathon.upiId}</p>
                              <p>Amount: ${hackathon.registrationFee}</p>
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
                                    src={paymentScreenshot || "/placeholder.svg"}
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
                            <Label htmlFor="transaction-id">Transaction ID (Optional)</Label>
                            <Input id="transaction-id" placeholder="Enter the transaction ID if available" />
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

              {/* Hackathon Info Sidebar */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Hackathon Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video relative overflow-hidden rounded-md">
                      <img
                        src={hackathon.image || "/placeholder.svg"}
                        alt={hackathon.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="text-xl font-bold">{hackathon.title}</h3>
                    <p className="text-sm text-muted-foreground">{hackathon.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{hackathon.date}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{hackathon.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Registration Fee: ${hackathon.registrationFee}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Max Team Size: {hackathon.maxTeamSize}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="font-medium mb-2">Registration Deadline</h3>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{hackathon.registrationDeadline}</span>
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
                      If you have any questions about the registration process or the hackathon, please contact us.
                    </p>
                    <Button variant="outline" className="w-full">
                      Contact Support
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

