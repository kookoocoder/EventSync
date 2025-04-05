"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, CreditCard, Eye, EyeOff, Key, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/SiteHeader"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

export default function ParticipantSettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Mock user data
  const user = {
    name: "Jane Participant",
    email: "jane@example.com",
    avatar: "/placeholder.svg?height=200&width=200",
  }

  const handleSaveSettings = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col">
          <SiteHeader />
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <Link href="/participant/profile">
                <Button variant="outline">View Profile</Button>
              </Link>
            </div>

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Update your account details and personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={user.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue="janeparticipant" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>JP</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">
                          Change Avatar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                      <Save className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Delete Account</CardTitle>
                    <CardDescription>Permanently delete your account and all associated data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Once you delete your account, there is no going back. All information associated with your account
                      will be permanently deleted.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="destructive">Delete Account</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input id="current-password" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                      {isSaving ? "Updating..." : "Update Password"}
                      <Key className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Protect your account with an additional verification step
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how and when you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email notifications about hackathons and updates
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New Hackathon Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified when new hackathons are announced</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Team Invitations</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when you're invited to join a team
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive promotional emails and newsletters</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Preferences"}
                      <Bell className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods for hackathon registrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <CreditCard className="h-6 w-6 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Visa ending in 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 04/2025</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View your past payments and registration fees</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">AI Innovation Challenge</p>
                          <p className="text-sm text-muted-foreground">Apr 15, 2025</p>
                        </div>
                        <p className="font-medium">$25.00</p>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">Web3 Hackathon</p>
                          <p className="text-sm text-muted-foreground">Mar 5, 2025</p>
                        </div>
                        <p className="font-medium">$15.00</p>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">GameDev Jam</p>
                          <p className="text-sm text-muted-foreground">Feb 20, 2025</p>
                        </div>
                        <p className="font-medium">$10.00</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

