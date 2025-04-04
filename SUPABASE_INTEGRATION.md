# HackSync + Supabase Integration Guide

This guide walks you through integrating Supabase with HackSync for authentication and database functionality.

## Table of Contents

1. [Setting Up Supabase Project](#1-setting-up-supabase-project)
2. [Authentication Integration](#2-authentication-integration)
3. [Database Schema Setup](#3-database-schema-setup)
4. [Client-Side Integration](#4-client-side-integration)
5. [Server-Side Functions](#5-server-side-functions)
6. [Deployment Considerations](#6-deployment-considerations)

## 1. Setting Up Supabase Project

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in or create an account
2. Click "New Project" and provide the necessary details:
   - Name: `hacksync` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the closest to your users
3. Click "Create new project" and wait for it to be provisioned (typically takes ~1 minute)

### Get API Keys

Once your project is created, you'll need the API keys:

1. Navigate to Project Settings → API
2. Note down the `URL` and `anon` (public) key
3. These will be used in the environment variables

## 2. Authentication Integration

### Set Up Environment Variables

Create or update your `.env.local` file in the root of your project:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Install Supabase Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Create Supabase Client

Create a new file at `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Auth Context Provider

Create a file at `components/auth-provider.tsx`:

```typescript
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { User, Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    session,
    isLoading,
    signUp: async (email: string, password: string, userData: any) => {
      return supabase.auth.signUp({
        email,
        password,
        options: { 
          data: userData
        }
      })
    },
    signIn: (email: string, password: string) => {
      return supabase.auth.signInWithPassword({ email, password })
    },
    signOut: () => {
      return supabase.auth.signOut()
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
```

### Update Root Layout

Update `app/layout.tsx` to include the AuthProvider:

```typescript
import { AuthProvider } from "@/components/auth-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

## 3. Database Schema Setup

### Users Tables

Supabase already provides an `auth.users` table, but you'll want to create extended profiles:

#### Participants Table

```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bio TEXT,
  skills TEXT[],
  avatar_url TEXT
);
```

#### Organizers Table

```sql
CREATE TABLE organizers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_name TEXT NOT NULL,
  organization_address TEXT,
  organization_website TEXT,
  organization_description TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE
);
```

### Events Tables

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  registration_fee NUMERIC(10, 2) DEFAULT 0,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_end_date TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT FALSE,
  prize_money TEXT,
  banner_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Teams and Registrations Tables

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES participants(id),
  team_code TEXT UNIQUE NOT NULL,
  project_idea TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id),
  team_id UUID REFERENCES teams(id),
  registration_type TEXT NOT NULL, -- 'individual', 'team'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'canceled'
  payment_status TEXT, -- 'paid', 'not_paid', 'free'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, participant_id)
);
```

### Row Level Security Policies

Set up Row Level Security (RLS) to secure your data:

```sql
-- Enable RLS
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Participants policies
CREATE POLICY "Participants can view their own data" ON participants
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Participants can update their own data" ON participants
  FOR UPDATE USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Anyone can view published events" ON events
  FOR SELECT USING (is_published = true);
  
CREATE POLICY "Organizers can view their own events" ON events
  FOR SELECT USING (auth.uid() = organizer_id);
  
CREATE POLICY "Organizers can update their own events" ON events
  FOR UPDATE USING (auth.uid() = organizer_id);
  
CREATE POLICY "Organizers can delete their own events" ON events
  FOR DELETE USING (auth.uid() = organizer_id);
  
CREATE POLICY "Organizers can insert events" ON events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Similar policies for teams, team_members, and registrations
```

## 4. Client-Side Integration

### Registration Flow

Update the register page to use Supabase authentication:

```typescript
// Updated onSubmit function for app/register/page.tsx
const onSubmit = async (data: z.infer<typeof organizerSchema>) => {
  if (userType === "organizer" && activeStep === "user") {
    const isValid = await form.trigger(["name", "email", "password", "confirmPassword", "userType"])
    if (isValid) {
      setActiveStep("organizer")
      return
    }
  } else {
    try {
      // First create the auth user
      const { error: authError, data: authData } = await useAuth().signUp(
        data.email, 
        data.password,
        {
          name: data.name,
          userType: data.userType,
        }
      )
      
      if (authError) throw authError
      
      // Then create the profile based on user type
      if (data.userType === "participant") {
        const { error: profileError } = await supabase
          .from('participants')
          .insert({
            id: authData.user?.id,
            name: data.name,
            email: data.email,
          })
        
        if (profileError) throw profileError
      } else {
        const { error: profileError } = await supabase
          .from('organizers')
          .insert({
            id: authData.user?.id,
            name: data.name,
            email: data.email,
            organization_name: data.organizationName,
            organization_address: data.organizationAddress,
            organization_website: data.organizationWebsite || null,
            organization_description: data.organizationDescription,
          })
        
        if (profileError) throw profileError
      }
      
      alert("Registration successful! Please check your email to verify your account.")
      router.push("/login")
    } catch (error) {
      console.error("Error during registration:", error)
      alert("Registration failed. Please try again.")
    }
  }
}
```

### Login Page

Update the login page to use Supabase authentication:

```typescript
// Import in app/login/page.tsx
import { useAuth } from "@/components/auth-provider"

// In your form submission handler
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  
  try {
    const { error } = await useAuth().signIn(email, password)
    if (error) throw error
    
    router.push("/dashboard")
  } catch (error) {
    console.error("Error during login:", error)
    setErrorMessage("Invalid email or password")
  } finally {
    setIsLoading(false)
  }
}
```

### Event Creation

For the organizer's event creation form:

```typescript
const createEvent = async (eventData: EventFormData) => {
  try {
    const { error, data } = await supabase
      .from('events')
      .insert({
        organizer_id: useAuth().user?.id,
        name: eventData.name,
        description: eventData.description,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        location: eventData.location,
        registration_fee: eventData.registrationFee,
        max_participants: eventData.maxParticipants,
        registration_end_date: eventData.registrationEndDate,
        is_published: eventData.isPublished,
        prize_money: eventData.prizeMoney,
        banner_image: eventData.bannerImage,
      })
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}
```

### Event Registration

For the event registration flow:

```typescript
const registerForEvent = async (registrationData: RegistrationFormData, eventId: string) => {
  const userId = useAuth().user?.id
  if (!userId) throw new Error("User not authenticated")
  
  try {
    // Start a transaction using RPC (Remote Procedure Call)
    const { error, data } = await supabase.rpc('register_for_event', {
      p_event_id: eventId,
      p_participant_id: userId,
      p_registration_type: registrationData.teamStatus,
      p_team_name: registrationData.teamName || null,
      p_team_members: registrationData.teamMembers?.map(m => m.username) || [],
      p_team_code: registrationData.teamCode || null,
      p_project_idea: registrationData.projectIdea || null,
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error during registration:", error)
    throw error
  }
}
```

## 5. Server-Side Functions

Create a function in Supabase to handle event registration:

```sql
CREATE OR REPLACE FUNCTION register_for_event(
  p_event_id UUID,
  p_participant_id UUID,
  p_registration_type TEXT,
  p_team_name TEXT DEFAULT NULL,
  p_team_members TEXT[] DEFAULT NULL,
  p_team_code TEXT DEFAULT NULL,
  p_project_idea TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_event RECORD;
  v_team_id UUID;
  v_registration_id UUID;
  v_payment_status TEXT;
BEGIN
  -- Check if event exists and registration is open
  SELECT * INTO v_event FROM events WHERE id = p_event_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Event not found');
  END IF;
  
  IF v_event.registration_end_date < NOW() THEN
    RETURN json_build_object('success', false, 'message', 'Registration closed');
  END IF;
  
  -- Set payment status based on registration fee
  IF v_event.registration_fee = 0 THEN
    v_payment_status := 'free';
  ELSE
    v_payment_status := 'not_paid';
  END IF;
  
  -- Create or join team if team registration
  IF p_registration_type = 'createTeam' THEN
    -- Generate a team code
    p_team_code := substring(md5(random()::text) from 1 for 8);
    
    -- Create team
    INSERT INTO teams (event_id, name, creator_id, team_code, project_idea)
    VALUES (p_event_id, p_team_name, p_participant_id, p_team_code, p_project_idea)
    RETURNING id INTO v_team_id;
    
    -- Add team members
    IF p_team_members IS NOT NULL AND array_length(p_team_members, 1) > 0 THEN
      FOR i IN 1..array_length(p_team_members, 1) LOOP
        INSERT INTO team_members (team_id, participant_id, status)
        SELECT v_team_id, id, 'pending'
        FROM participants
        WHERE email = p_team_members[i];
      END LOOP;
    END IF;
  ELSIF p_registration_type = 'joinTeam' THEN
    -- Find team by code
    SELECT id INTO v_team_id FROM teams WHERE team_code = p_team_code;
    IF NOT FOUND THEN
      RETURN json_build_object('success', false, 'message', 'Invalid team code');
    END IF;
    
    -- Add participant to team
    INSERT INTO team_members (team_id, participant_id, status)
    VALUES (v_team_id, p_participant_id, 'accepted');
  END IF;
  
  -- Create registration
  INSERT INTO registrations (event_id, participant_id, team_id, registration_type, status, payment_status)
  VALUES (p_event_id, p_participant_id, v_team_id, p_registration_type, 'pending', v_payment_status)
  RETURNING id INTO v_registration_id;
  
  -- Update event participant count
  UPDATE events SET current_participants = current_participants + 1 WHERE id = p_event_id;
  
  RETURN json_build_object(
    'success', true, 
    'registration_id', v_registration_id, 
    'team_id', v_team_id,
    'payment_status', v_payment_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 6. Deployment Considerations

### Environment Variables

Make sure your deployment environment has the necessary environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Edge Functions (Optional)

For more complex operations, you can create Edge Functions in Supabase:

1. Install Supabase CLI: `npm install -g supabase`
2. Initialize: `supabase init`
3. Create a function: `supabase functions new process-payment`
4. Deploy: `supabase functions deploy process-payment`

### Handling File Uploads

For event banners and user avatars:

```typescript
const uploadEventBanner = async (file: File, eventId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${eventId}.${fileExt}`
  const filePath = `event-banners/${fileName}`
  
  const { error } = await supabase.storage
    .from('event-images')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type
    })
  
  if (error) throw error
  
  const { data } = supabase.storage
    .from('event-images')
    .getPublicUrl(filePath)
    
  return data.publicUrl
}
```

### Real-time Updates

For real-time team member invitations:

```typescript
// Subscribe to team invitations
useEffect(() => {
  if (!userId) return
  
  const teamSubscription = supabase
    .channel('team-invitations')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'team_members',
        filter: `participant_id=eq.${userId}`
      },
      (payload) => {
        // Handle new team invitation
        setInvitations(prev => [...prev, payload.new])
      }
    )
    .subscribe()
    
  return () => {
    supabase.removeChannel(teamSubscription)
  }
}, [userId])
```

## Conclusion

This guide provides a comprehensive approach to integrating Supabase with HackSync. By following these steps, you'll have authentication, database, storage, and real-time features ready to use.

Remember to:
- Set up proper Row Level Security policies
- Test thoroughly before deploying to production
- Consider adding server-side validation for critical operations
- Keep your API keys secure and never expose them in client-side code

For more information, refer to the [Supabase documentation](https://supabase.com/docs). 