// EventSync/app/participant/template.tsx (Simplified - Use AuthGuard)
import AuthGuard from '@/components/auth/AuthGuard'

export default function ParticipantTemplate({
  children
}: {
  children: React.ReactNode
}) {
  // AuthGuard handles loading, auth check, and role check
  return (
    <AuthGuard userTypes={['participant']} requireAuth={true}>
      {children}
    </AuthGuard>
  )
}