import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative">
      {/* Hero background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-violet-800 mix-blend-multiply" />
      <div className="relative bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center">
        <div className="container pl-4 pr-8 mx-auto max-w-7xl flex flex-col items-center justify-center space-y-8 py-24 text-center md:py-32 lg:py-40">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Innovate. Create. Collaborate.
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-white/90 md:text-xl">
              Join the most exciting events and turn your ideas into reality. Connect with like-minded innovators
              and showcase your skills.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/events">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90">
                Explore Events <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register?type=organizer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Organize an Event
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 pt-8 md:gap-16 lg:gap-24">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-white/80">Events</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">50k+</p>
              <p className="text-sm text-white/80">Participants</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">$2M+</p>
              <p className="text-sm text-white/80">In Prizes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

