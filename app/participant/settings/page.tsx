"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CreditCard, Eye, EyeOff, Key, Save, User as UserIcon, Settings as SettingsIcon, LogOut, Loader2, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ParticipantSettingsPage() {
    const { user, isLoading: authLoading, signOut, supabase } = useAuth();
    const router = useRouter();

    // States for Account Info Tab
    const [name, setName] = useState('');
    const [initialName, setInitialName] = useState(''); // Store initial name for comparison
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSavingAccount, setIsSavingAccount] = useState(false);
    const [accountStatus, setAccountStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // States for other tabs (keep as before)
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [notificationPrefs, setNotificationPrefs] = useState({ emailNotifications: true, newHackathonAlerts: true, teamInvitations: true, marketingEmails: false });
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);
    const [notificationStatus, setNotificationStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Initialize form state when user data loads
    useEffect(() => {
        if (user) {
            const currentName = user.user_metadata?.name || '';
            setName(currentName);
            setInitialName(currentName); // Store the initial name
            setPreviewUrl(user.user_metadata?.avatar_url || null);
        }
    }, [user]);

    // --- Event Handlers ---

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAccountStatus(null);
        const file = e.target.files?.[0];
        if (file) {
            // File validation (size, type)
            const maxSizeMB = 5;
            if (file.size > maxSizeMB * 1024 * 1024) {
                setAccountStatus({ type: 'error', message: `File size exceeds ${maxSizeMB}MB limit.` });
                setSelectedFile(null); setPreviewUrl(user?.user_metadata?.avatar_url || null); e.target.value = ''; return;
            }
            const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setAccountStatus({ type: 'error', message: 'Invalid file type.' });
                setSelectedFile(null); setPreviewUrl(user?.user_metadata?.avatar_url || null); e.target.value = ''; return;
            }
            // Set file and preview
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => { setPreviewUrl(reader.result as string); };
            reader.readAsDataURL(file);
        } else {
            // Reset if no file selected
            setSelectedFile(null);
            setPreviewUrl(user?.user_metadata?.avatar_url || null);
        }
    };

    // --- UPDATED handleSaveAccountInfo (API handles name update) ---
    const handleSaveAccountInfo = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !supabase) return;

        // Determine if changes exist directly here
        const nameChanged = name !== initialName; // Compare against initial name
        const avatarChanged = !!selectedFile;

        if (!nameChanged && !avatarChanged) {
            setAccountStatus({ type: 'success', message: 'No changes detected.' }); // Use success variant for info
            return;
        }

        setIsSavingAccount(true);
        setAccountStatus(null);

        try {
            console.log("Sending profile update to API route...");
            const formData = new FormData();
            // Always send the current name value from the form
            formData.append('name', name);
            // Append avatar only if it changed
            if (avatarChanged) {
                formData.append('avatar', selectedFile);
            }

            const response = await fetch('/api/upload-avatar', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! Status: ${response.status}`);
            }

            console.log("API Response:", result);
            setAccountStatus({ type: 'success', message: result.message || 'Profile updated successfully!' });

            // Update local state after successful API call
            setInitialName(name); // Update initial name baseline
            if (result.avatarUrl) {
                setPreviewUrl(result.avatarUrl); // Update preview with final URL
            }
            setSelectedFile(null); // Clear selected file

            // Refresh server components to reflect potential changes fetched elsewhere
            router.refresh();

        } catch (error: any) {
            console.error("Error saving account info:", error);
            setAccountStatus({ type: 'error', message: error.message || 'An unknown error occurred.' });
            // Reset preview only if a file was selected and upload failed
            if (selectedFile) {
                setPreviewUrl(user.user_metadata?.avatar_url || null);
            }
        } finally {
            setIsSavingAccount(false);
        }
    };

    const handleUpdatePassword = async (e: FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        setPasswordStatus(null); // Clear previous status
        if (newPassword !== confirmPassword) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) { // Use Supabase minimum length (default 6)
             setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
            return;
        }

        setIsSavingPassword(true);
        try {
            // Note: Supabase doesn't have a direct "updatePassword" requiring the old one.
            // You just use updateUser with the new password.
            // Add checks for currentPassword if needed by your application logic elsewhere.
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                console.error("Password Update Error:", error);
                throw new Error(`Failed to update password: ${error.message}`);
            }

             setPasswordStatus({ type: 'success', message: 'Password updated successfully.' });
             // Clear password fields after success
             setCurrentPassword('');
             setNewPassword('');
             setConfirmPassword('');
             setShowPassword(false); // Hide passwords again

        } catch (error: any) {
             console.error("Error updating password:", error);
             setPasswordStatus({ type: 'error', message: error.message || 'An unknown error occurred.' });
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleNotificationChange = (id: keyof typeof notificationPrefs, checked: boolean) => {
        setNotificationPrefs(prev => ({ ...prev, [id]: checked }));
        setNotificationStatus(null); // Clear status on change
    };

    const handleSaveNotifications = async (e: FormEvent) => {
         e.preventDefault();
         setIsSavingNotifications(true);
         setNotificationStatus(null);
         console.log("Saving Notification Preferences...", notificationPrefs);
        // TODO: Implement API call to save preferences (e.g., to a user_preferences table)
         try {
             // Simulate API Call
             await new Promise(resolve => setTimeout(resolve, 1000));
             // Assume success for now
             setNotificationStatus({ type: 'success', message: 'Notification preferences saved.' });
         } catch (error: any) {
             setNotificationStatus({ type: 'error', message: 'Failed to save preferences.' });
         } finally {
             setIsSavingNotifications(false);
         }
    };
    // --- Render Logic ---

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" /> {/* Use specific loader */}
            </div>
        );
    }

    if (!user) {
       return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                 <Card className="w-full max-w-md text-center">
                    <CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Please log in to access your settings.</p>
                        <Link href="/login"><Button>Go to Login</Button></Link>
                    </CardContent>
                 </Card>
            </div>
        );
    }

    // Derive initials for fallback
    const userInitials = initialName // Use initialName for consistency until update
        ? initialName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : user.email?.[0]?.toUpperCase() || 'U';

    // Calculate if changes exist for the button state *within render*
    const hasUnsavedChanges = (user ? name !== initialName : false) || !!selectedFile;
    const isSubmitDisabled = isSavingAccount || !hasUnsavedChanges;

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader /> {/* SiteHeader handles its own user logic via useAuth */}

            <main className="flex-1">
                <div className="container py-8">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                            <Link href="/participant/profile">
                                <Button variant="outline">View Profile</Button>
                            </Link>
                        </div>

                        {/* Status Alert Area */}
                        {accountStatus && (
                             <Alert variant={accountStatus.type === 'error' ? 'destructive' : 'default'} className={accountStatus.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : ''}>
                                {accountStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                <AlertTitle>{accountStatus.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                <AlertDescription>{accountStatus.message}</AlertDescription>
                            </Alert>
                        )}
                         {passwordStatus && (
                             <Alert variant={passwordStatus.type === 'error' ? 'destructive' : 'default'} className={passwordStatus.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : ''}>
                                {passwordStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                <AlertTitle>{passwordStatus.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                <AlertDescription>{passwordStatus.message}</AlertDescription>
                            </Alert>
                        )}
                          {notificationStatus && (
                             <Alert variant={notificationStatus.type === 'error' ? 'destructive' : 'default'} className={notificationStatus.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : ''}>
                                {notificationStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                <AlertTitle>{notificationStatus.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                <AlertDescription>{notificationStatus.message}</AlertDescription>
                            </Alert>
                        )}


                        <Tabs defaultValue="account" className="w-full">
                             <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
                                <TabsTrigger value="account">Account</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                                <TabsTrigger value="billing">Billing</TabsTrigger>
                            </TabsList>

                             {/* Account Tab Form */}
                             <TabsContent value="account" className="mt-0 space-y-6">
                                 <form onSubmit={handleSaveAccountInfo}>
                                     <Card>
                                         <CardHeader>
                                             <CardTitle>Account Information</CardTitle>
                                            <CardDescription>Update your name and profile picture.</CardDescription>
                                         </CardHeader>
                                         <CardContent className="space-y-4">
                                              {/* Name Input */}
                                             <div className="space-y-2">
                                                 <Label htmlFor="name">Full Name</Label>
                                                 <Input id="name" value={name} onChange={(e) => { setName(e.target.value); setAccountStatus(null); }} required />
                                             </div>
                                             {/* Email (Read Only) */}
                                              <div className="space-y-2">
                                                 <Label htmlFor="email">Email Address</Label>
                                                 <Input id="email" type="email" value={user.email || ''} readOnly disabled />
                                                 <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                             </div>
                                             {/* Avatar Upload */}
                                              <div className="space-y-2">
                                                <Label>Profile Picture</Label>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-16 w-16">
                                                        {/* Key forces re-render when previewUrl changes */}
                                                        <AvatarImage src={previewUrl || undefined} alt={name || 'User Avatar'} key={previewUrl} />
                                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                                    </Avatar>
                                                    <Button type="button" variant="outline" size="sm" asChild>
                                                        <Label htmlFor="avatar-upload" className="cursor-pointer">
                                                            {selectedFile ? "Change" : "Upload"} Avatar
                                                        </Label>
                                                    </Button>
                                                    <Input id="avatar-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleFileChange} />
                                                    {/* Show Cancel only if preview is different from original and a file is selected */}
                                                    {selectedFile && previewUrl !== (user.user_metadata?.avatar_url || null) && (
                                                         <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedFile(null); setPreviewUrl(user.user_metadata?.avatar_url || null); (document.getElementById('avatar-upload') as HTMLInputElement).value = ''; }}>Cancel Change</Button>
                                                    )}
                                                </div>
                                                 <p className="text-xs text-muted-foreground">Recommended: Square image, PNG/JPG/WEBP, max 5MB.</p>
                                            </div>
                                         </CardContent>
                                         <CardFooter>
                                             {/* Use the correctly scoped calculated flag */}
                                             <Button type="submit" disabled={isSubmitDisabled}>
                                                 {isSavingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                 Save Changes
                                                 {!isSavingAccount && <Save className="ml-2 h-4 w-4" />}
                                             </Button>
                                         </CardFooter>
                                     </Card>
                                 </form>

                                {/* Delete Account Card */}
                                <Card className="border-destructive">
                                    {/* ... (Delete account card content as before) ... */}
                                     <CardHeader>
                                        <CardTitle className="text-destructive">Delete Account</CardTitle>
                                        <CardDescription>Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-destructive/90">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        {/* TODO: Add confirmation dialog before actual deletion */}
                                        <Button variant="destructive" onClick={() => alert('Delete Account functionality not implemented yet.')}>Delete My Account</Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            {/* Security Tab */}
                             <TabsContent value="security" className="mt-0 space-y-6">
                                <form onSubmit={handleUpdatePassword}>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Change Password</CardTitle>
                                            <CardDescription>Update your password to keep your account secure.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Current Password - Usually not needed for Supabase updateUser */}
                                            {/* <div className="space-y-2">...</div> */}
                                            <div className="space-y-2">
                                                <Label htmlFor="new-password">New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="new-password"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter new password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        required
                                                        minLength={6} // Enforce minimum length
                                                    />
                                                     <Button
                                                        type="button" variant="ghost" size="icon"
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                                <Input
                                                    id="confirm-password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Confirm new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            {/* Use the calculated flag */}
                                             <Button type="submit" disabled={isSubmitDisabled}>
                                                 {isSavingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                 Save Changes
                                                 {!isSavingAccount && <Save className="ml-2 h-4 w-4" />}
                                             </Button>
                                         </CardFooter>
                                    </Card>
                                </form>
                                {/* 2FA Card (remains disabled for now) */}
                                <Card>
                                    {/* ... (2FA card content as before) ... */}
                                      <CardHeader>
                                        <CardTitle>Two-Factor Authentication</CardTitle>
                                        <CardDescription>Add an extra layer of security to your account.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5 pr-4">
                                                <Label className="font-medium" htmlFor="two-factor-switch">Enable 2FA</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Protect your account with an additional verification step.
                                                </p>
                                            </div>
                                            <Switch id="two-factor-switch" disabled />
                                        </div>
                                          <p className="text-xs text-muted-foreground mt-4">Two-factor authentication setup is not yet available.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Notifications Tab */}
                           <TabsContent value="notifications" className="mt-0 space-y-6">
                                <form onSubmit={handleSaveNotifications}>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Notification Preferences</CardTitle>
                                            <CardDescription>Manage how and when you receive notifications.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4 divide-y">
                                            {/* Simplified Switch structure */}
                                            <div className="flex items-center justify-between pt-4 first:pt-0">
                                                <Label htmlFor="email-notifications" className="font-medium flex-1 pr-4">Receive general email notifications</Label>
                                                <Switch
                                                    id="email-notifications"
                                                    checked={notificationPrefs.emailNotifications}
                                                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pt-4">
                                                <Label htmlFor="new-hackathon-alerts" className="font-medium flex-1 pr-4">Notify me about new hackathons</Label>
                                                <Switch
                                                     id="new-hackathon-alerts"
                                                     checked={notificationPrefs.newHackathonAlerts}
                                                     onCheckedChange={(checked) => handleNotificationChange('newHackathonAlerts', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pt-4">
                                                 <Label htmlFor="team-invitations" className="font-medium flex-1 pr-4">Notify me about team invitations</Label>
                                                 <Switch
                                                    id="team-invitations"
                                                    checked={notificationPrefs.teamInvitations}
                                                    onCheckedChange={(checked) => handleNotificationChange('teamInvitations', checked)}
                                                 />
                                            </div>
                                            <div className="flex items-center justify-between pt-4">
                                                 <Label htmlFor="marketing-emails" className="font-medium flex-1 pr-4">Receive promotional emails</Label>
                                                 <Switch
                                                    id="marketing-emails"
                                                    checked={notificationPrefs.marketingEmails}
                                                    onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                                                  />
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button type="submit" disabled={isSavingNotifications}>
                                                 {isSavingNotifications && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {isSavingNotifications ? "Saving..." : "Save Preferences"}
                                                {!isSavingNotifications && <Bell className="ml-2 h-4 w-4" />}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </form>
                            </TabsContent>

                            {/* Billing Tab (remains static for now) */}
                            <TabsContent value="billing" className="mt-0 space-y-6">
                                {/* ... (Billing card content as before) ... */}
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Methods</CardTitle>
                                        <CardDescription>Manage your saved payment methods for hackathon registrations.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Example Saved Card */}
                                        <div className="rounded-lg border p-4 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium">Visa ending in 4242</p>
                                                    <p className="text-sm text-muted-foreground">Expires 04/2025</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">Remove</Button>
                                        </div>
                                         {/* Add Payment Method Button */}
                                        <Button variant="outline" className="w-full justify-start">
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Add Payment Method
                                        </Button>
                                          <p className="text-xs text-muted-foreground mt-4">Payment method management is not yet fully implemented.</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Billing History</CardTitle>
                                        <CardDescription>View your past payments and registration fees.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {/* Example Billing Item 1 */}
                                            <div className="flex items-center justify-between py-2 border-b last:border-0">
                                                <div>
                                                    <p className="font-medium">AI Innovation Challenge</p>
                                                    <p className="text-sm text-muted-foreground">Apr 15, 2025</p>
                                                </div>
                                                <p className="font-medium">$25.00</p>
                                            </div>
                                             {/* Placeholder if no history */}
                                             {/* <p className="text-sm text-muted-foreground text-center py-4">No billing history found.</p> */}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}