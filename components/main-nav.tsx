"use client";

import Link from "next/link"
import { Code } from "lucide-react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

import { ThemeToggle } from "@/components/theme-toggle"

export function MainNav() {
  const pathname = usePathname();
  
  // Animation variants for logo
  const logoVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: { 
      scale: 1.05,
      transition: { 
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };
  
  // Animation variants for nav items
  const navItemVariants = {
    hover: { 
      y: -2,
      transition: { 
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <div className="flex items-center gap-6 md:gap-10">
      <motion.div
        initial="initial"
        animate="animate"
        whileHover="hover"
        variants={logoVariants}
      >
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-primary/10 p-1.5 rounded-xl">
            <Code className="h-5 w-5 text-primary" />
          </div>
          <span className="font-['Outfit'] font-bold inline-block">EventSync</span>
        </Link>
      </motion.div>
      
      <nav className="hidden md:flex gap-6">
        <motion.div whileHover="hover" variants={navItemVariants}>
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary relative menu-item ${
              pathname === "/" ? "active text-foreground" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
        </motion.div>
        
        <motion.div whileHover="hover" variants={navItemVariants}>
          <Link
            href="/events"
            className={`text-sm font-medium transition-colors hover:text-primary relative menu-item ${
              pathname.startsWith("/events") ? "active text-foreground" : "text-muted-foreground"
            }`}
          >
            Events
          </Link>
        </motion.div>
        
        <motion.div whileHover="hover" variants={navItemVariants}>
          <Link 
            href="/about" 
            className={`text-sm font-medium transition-colors hover:text-primary relative menu-item ${
              pathname === "/about" ? "active text-foreground" : "text-muted-foreground"
            }`}
          >
            About
          </Link>
        </motion.div>
        
        <motion.div whileHover="hover" variants={navItemVariants}>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors hover:text-primary relative menu-item ${
              pathname === "/contact" ? "active text-foreground" : "text-muted-foreground"
            }`}
          >
            Contact
          </Link>
        </motion.div>
      </nav>
      
      <div className="md:hidden">
        <ThemeToggle />
      </div>
    </div>
  )
}

