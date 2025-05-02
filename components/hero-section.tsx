"use client";

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { FadeInSection } from "@/components/ui/fade-in-section"

export function HeroSection() {
  return (
    <section className="relative">
      {/* Hero background with enhanced overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 to-primary-dark/90 mix-blend-multiply" />
      <div className="relative bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center">
        <div className="container pl-4 pr-8 mx-auto max-w-7xl flex flex-col items-center justify-center space-y-10 py-24 text-center md:py-32 lg:py-40">
          <FadeInSection direction="up" delay={0.1}>
            <div className="space-y-6">
              <motion.h1 
                className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                Innovate. Create. <span className="text-accent">Collaborate.</span>
              </motion.h1>
              <motion.p 
                className="mx-auto max-w-[700px] text-lg md:text-xl text-foreground/90 dark:text-white/90"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Join the most exciting events and turn your ideas into reality. Connect with like-minded innovators
                and showcase your skills.
              </motion.p>
            </div>
          </FadeInSection>
          
          <FadeInSection direction="up" delay={0.4}>
            <div className="flex flex-col gap-5 sm:flex-row">
              <Link href="/events">
                <Button 
                  size="lg" 
                  className="px-8 py-6 rounded-full font-medium text-base btn-primary 
                             bg-white text-primary-dark hover:bg-white/90 
                             dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                >
                  Explore Events <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register?type=organizer">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-6 rounded-full font-medium text-base 
                             border-border text-foreground hover:bg-accent hover:text-accent-foreground 
                             dark:border-white dark:text-white dark:hover:bg-white/10"
                >
                  Organize an Event
                </Button>
              </Link>
            </div>
          </FadeInSection>
          
          <FadeInSection direction="up" delay={0.6}>
            <div className="flex items-center justify-center gap-8 pt-8 md:gap-16 lg:gap-24">
              <motion.div 
                className="text-center" 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-sm text-white/80">Events</p>
              </motion.div>
              <motion.div 
                className="text-center" 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <p className="text-3xl font-bold text-white">50k+</p>
                <p className="text-sm text-white/80">Participants</p>
              </motion.div>
              <motion.div 
                className="text-center" 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <p className="text-3xl font-bold text-white">₹ 15Cr+</p>
                <p className="text-sm text-white/80">Total Event Value Managed</p>
              </motion.div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  )
}

