// EventSync/app/organizer/template.tsx (Simplified - Use AuthGuard)
import AuthGuard from '@/components/auth/AuthGuard'

export default function OrganizerTemplate({
  children
}: {
  children: React.ReactNode
}) {
    // AuthGuard handles loading, auth check, and role check
  return (
    <AuthGuard userTypes={['organizer']} requireAuth={true}>
      {children}
    </AuthGuard>
  )
}