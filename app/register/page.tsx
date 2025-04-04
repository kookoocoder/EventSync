"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { registerUser } from "./actions"
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Use a separate state to track form submission
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const form = useForm<FormData>({
    // Use organizerSchema for type purposes, but we'll handle validation manually
    resolver: zodResolver(organizerSchema) as any, // Type assertion to avoid TS errors
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
    mode: 'onChange',
  });
  
  // Remove errors from formState destructuring since we're using manual validation
  const { isSubmitting } = form.formState; // Not used, but keep for reference

  const handleUserTypeChange = (value: "participant" | "organizer") => {
    setUserType(value);
    form.reset({
        ...form.getValues(),
        userType: value,
        organizationName: value === 'participant' ? '' : form.getValues('organizationName'),
        organizationAddress: value === 'participant' ? '' : form.getValues('organizationAddress'),
        organizationWebsite: value === 'participant' ? '' : form.getValues('organizationWebsite'),
        organizationDescription: value === 'participant' ? '' : form.getValues('organizationDescription'),
    });
    setActiveStep('user');
    setErrorMessage(null);
  };

  const watchUserType = form.watch("userType");

  // Create a direct submission handler that bypasses RHF's handleSubmit
  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    
    console.log("Manual submit handler called");
    setErrorMessage(null);
    setIsFormSubmitting(true);
    
    try {
      // For organizer on first step, validate and move to next step
      if (watchUserType === "organizer" && activeStep === "user") {
        console.log("Organizer step 1: Validating first step fields");
        const firstStepFields = ["name", "email", "password", "confirmPassword"];
        const isValid = await form.trigger(firstStepFields as any);
        
        // Also check password match manually
        const values = form.getValues();
        const passwordsMatch = values.password === values.confirmPassword;
        
        if (isValid && passwordsMatch) {
          console.log("First step validation passed, moving to organizer step");
          setActiveStep("organizer");
        } else {
          console.log("First step validation failed:", form.formState.errors);
          if (!passwordsMatch) {
            form.setError("confirmPassword", { 
              type: "manual", 
              message: "Passwords do not match" 
            });
          }
          setErrorMessage("Please fix the errors in the form.");
        }
      } 
      // For final submission (participant or organizer step 2)
      else {
        console.log("Submitting form data:", form.getValues());
        
        // Validate manually based on user type
        let isValid: boolean;
        
        if (watchUserType === "participant") {
          // For participants, only validate participant fields
          isValid = await form.trigger([
            "name", "email", "password", "confirmPassword", "userType"
          ] as any);
          
          // Check password match
          const values = form.getValues();
          if (values.password !== values.confirmPassword) {
            form.setError("confirmPassword", {
              type: "manual", 
              message: "Passwords do not match"
            });
            isValid = false;
          }
        } else {
          // For organizers on step 2, validate all fields
          isValid = await form.trigger();
        }
        
        if (isValid) {
          const data = form.getValues();
          console.log("Sending to server action:", data);
          
          await registerUser(data);
        } else {
          console.log("Validation failed:", form.formState.errors);
          setErrorMessage("Please fix the errors in the form.");
        }
      }
    } catch (error: any) {
      console.error("Error during form processing:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
      setIsFormSubmitting(false);
    }
  };

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
                <form onSubmit={handleManualSubmit} className="space-y-4">
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
                              onValueChange={handleUserTypeChange}
                              value={field.value}
                              disabled={isFormSubmitting}
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
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isFormSubmitting}
                      >
                        {isFormSubmitting 
                          ? "Processing..." 
                          : (watchUserType === "organizer") 
                            ? "Next" 
                            : "Create Account"}
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
                        disabled={isFormSubmitting}
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1" 
                        disabled={isFormSubmitting}
                      >
                        {isFormSubmitting ? "Processing..." : "Create Account"}
                      </Button>
                    </div>
                  </TabsContent>
                </form>
              </Form>
            </Tabs>
            {errorMessage && (
              <p className="text-sm font-medium text-destructive pt-4 text-center">{errorMessage}</p>
            )}
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

