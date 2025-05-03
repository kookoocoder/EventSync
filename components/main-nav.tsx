"use client";

import Link from "next/link"
import { Code, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function MainNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  // Mobile menu animation variants
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  };

  // Mobile menu item variants
  const mobileItemVariants = {
    closed: {
      opacity: 0,
      y: -10,
    },
    open: {
      opacity: 1, 
      y: 0,
      transition: {
        ease: "easeOut"
      }
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="flex items-center justify-between w-full md:justify-start md:gap-10">
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
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-6">
        <motion.div 
          whileHover="hover" 
          variants={navItemVariants}
          animate={pathname === "/" ? { y: -2 } : {}}
        >
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary relative menu-item ${
              pathname === "/" ? "active text-primary font-semibold nav-active px-3 py-1.5 rounded-md" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
        </motion.div>
        
        <motion.div 
          whileHover="hover" 
          variants={navItemVariants}
          animate={pathname.startsWith("/events") ? { y: -2 } : {}}
        >
          <Link
            href="/events"
            className={`text-sm font-medium transition-colors hover:text-primary relative menu-item ${
              pathname.startsWith("/events") ? "active text-primary font-semibold nav-active px-3 py-1.5 rounded-md" : "text-muted-foreground"
            }`}
          >
            Events
          </Link>
        </motion.div>
        
        <motion.div 
          whileHover="hover" 
          variants={navItemVariants}
          animate={pathname === "/about" ? { y: -2 } : {}}
        >
          <Link 
            href="/about" 
            className={`text-sm font-medium transition-colors hover:text-primary relative menu-item ${
              pathname === "/about" ? "active text-primary font-semibold nav-active px-3 py-1.5 rounded-md" : "text-muted-foreground"
            }`}
          >
            About
          </Link>
        </motion.div>
        
        <motion.div 
          whileHover="hover" 
          variants={navItemVariants}
          animate={pathname === "/contact" ? { y: -2 } : {}}
        >
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors hover:text-primary relative menu-item ${
              pathname === "/contact" ? "active text-primary font-semibold nav-active px-3 py-1.5 rounded-md" : "text-muted-foreground"
            }`}
          >
            Contact
          </Link>
        </motion.div>
      </nav>
      
      {/* Mobile Menu Button and Theme Toggle */}
      <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9"
          onClick={toggleMobileMenu}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute top-16 inset-x-0 glass-nav border-b z-50 py-4 px-6 shadow-lg"
          >
            <nav className="flex flex-col space-y-3">
              <motion.div variants={mobileItemVariants}>
                <Link 
                  href="/" 
                  className={`text-base font-medium px-3 py-2 rounded-md transition-colors ${
                    pathname === "/" ? "bg-primary/10 text-primary font-semibold nav-active" : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </motion.div>
              
              <motion.div variants={mobileItemVariants}>
                <Link 
                  href="/events" 
                  className={`text-base font-medium px-3 py-2 rounded-md transition-colors ${
                    pathname.startsWith("/events") ? "bg-primary/10 text-primary font-semibold nav-active" : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Events
                </Link>
              </motion.div>
              
              <motion.div variants={mobileItemVariants}>
                <Link 
                  href="/about" 
                  className={`text-base font-medium px-3 py-2 rounded-md transition-colors ${
                    pathname === "/about" ? "bg-primary/10 text-primary font-semibold nav-active" : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </motion.div>
              
              <motion.div variants={mobileItemVariants}>
                <Link 
                  href="/contact" 
                  className={`text-base font-medium px-3 py-2 rounded-md transition-colors ${
                    pathname === "/contact" ? "bg-primary/10 text-primary font-semibold nav-active" : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

