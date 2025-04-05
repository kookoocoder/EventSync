# Supabase Authentication Implementation

This project uses Supabase for authentication. Below is an explanation of the implementation and required setup.

## Environment Variables

Make sure you have the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Implementation Details

The authentication system uses Supabase's cookie-based auth with server-side rendering support. Key components:

1. **Auth Provider** (`components/auth-provider.tsx`)
   - Manages authentication state throughout the app
   - Provides `useAuth()` hook for accessing auth context
   - Exports the Supabase client for direct use

2. **Server Actions**
   - Login (`app/login/actions.ts`) - Handles user login
   - Registration (`app/register/actions.ts`) - Handles user registration

3. **Middleware** (`middleware.ts`)
   - Protects routes that require authentication
   - Redirects to login page for unauthenticated users
   - Redirects authenticated users away from login/register pages

## Database Tables

The implementation assumes these Supabase database tables:

- `participants` - For participant user profiles
- `organizers` - For organizer user profiles

## Workflow

1. **Registration**:
   - User fills out registration form
   - Server action creates user in Supabase Auth
   - Profile is created in appropriate table (participants/organizers)
   - User receives email verification (if enabled in Supabase)

2. **Login**:
   - User enters credentials
   - Server action authenticates with Supabase
   - On success, user is redirected to appropriate dashboard

3. **Protected Routes**:
   - Middleware checks authentication status
   - Redirects to login if user not authenticated

## Requirements

You must install the following packages:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Customization

If you need to customize the authentication flow:

- Modify the `auth-provider.tsx` for client-side auth logic
- Modify the server actions for registration/login logic
- Update the middleware for route protection rules 