import Link from "next/link"
import { Code } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

export function MainNav() {
  return (
    <div className="flex items-center gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Code className="h-6 w-6" />
        <span className="font-bold inline-block">EventSync</span>
      </Link>
      <nav className="hidden md:flex gap-6">
        <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
          Home
        </Link>
        <Link
          href="/events"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Events
        </Link>
        <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
          About
        </Link>
        <Link
          href="/contact"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Contact
        </Link>
      </nav>
      <div className="md:hidden">
        <ThemeToggle />
      </div>
    </div>
  )
}

