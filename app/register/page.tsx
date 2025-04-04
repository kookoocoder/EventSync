"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

// Base schema for user registration
const baseUserSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string(),
  userType: z.enum(["participant", "organizer"]),
})

// Organizer-specific schema parts
const organizerFields = {
  organizationName: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  organizationAddress: z.string().min(5, {
    message: "Please enter a valid address.",
  }),
  organizationWebsite: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal("")),
  organizationDescription: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
}

// Extend base schema first
const organizerSchema = baseUserSchema.extend(organizerFields)
// Then apply refine to the extended schema
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Base schema with refine for participant (if needed separately)
const participantSchema = baseUserSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Type for the form data - includes all possible fields
type FormData = z.infer<typeof organizerSchema>;

export default function RegisterPage() {
  const [activeStep, setActiveStep] = useState<"user" | "organizer">("user")
  const [userType, setUserType] = useState<"participant" | "organizer">("participant")

  // Initialize form with the combined type
  const form = useForm<FormData>({
    resolver: zodResolver(userType === "organizer" ? organizerSchema : participantSchema) as any, // Use type assertion for resolver
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "participant",
      organizationName: "",
      organizationAddress: "",
      organizationWebsite: "",
      organizationDescription: "",
    },
  })

  // Watch for user type changes
  const watchUserType = form.watch("userType")
  
  // Update form schema and active step when user type changes
  const handleUserTypeChange = (value: "participant" | "organizer") => {
    setUserType(value)
    form.setValue("userType", value)
    
    if (value === "organizer") {
      form.clearErrors()
    }
  }

  const onSubmit = async (data: FormData) => {
    if (userType === "organizer" && activeStep === "user") {
      // Only validate user fields and move to organizer step
      const isValid = await form.trigger(["name", "email", "password", "confirmPassword", "userType"])
      if (isValid) {
        setActiveStep("organizer")
        return
      }
    } else {
      // Submit the form to Supabase
      console.log("Form submitted:", data)
      // Here you would typically call your Supabase registration function
      alert("Registration successful! Redirecting to login...")
      // Then redirect to login page
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Join HackSync to participate in exciting hackathons or organize your own events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeStep} className="w-full">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <TabsContent value="user">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john.doe@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input placeholder="********" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input placeholder="********" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="userType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>I want to</FormLabel>
                            <Select 
                              onValueChange={(value: "participant" | "organizer") => {
                                field.onChange(value)
                                handleUserTypeChange(value)
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="participant">Participate in hackathons</SelectItem>
                                <SelectItem value="organizer">Organize hackathons</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="pt-6">
                      <Button type="submit" className="w-full">
                        {watchUserType === "organizer" ? "Next" : "Create Account"}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="organizer">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="organizationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Tech Innovators Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="organizationAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Innovation St, Tech City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="organizationWebsite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter your organization's website URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="organizationDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your organization..." 
                                className="resize-none" 
                                rows={4}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="pt-6 flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setActiveStep("user")}
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        Create Account
                      </Button>
                    </div>
                  </TabsContent>
                </form>
              </Form>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

