// EventSync/app/layout.tsx (Ensure correct AuthProvider path)
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider" // Corrected path
import { AuthProvider } from "@/components/auth/AuthProvider" // Corrected path

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EventSync",
  description: "Connect, collaborate, and compete in hackathons",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* AuthProvider wraps the entire application */}
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}