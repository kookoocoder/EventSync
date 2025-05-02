"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface FadeInSectionProps {
  children: ReactNode;
  threshold?: number;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export function FadeInSection({
  children,
  threshold = 0.2,
  delay = 0,
  direction = "up",
  className = "",
}: FadeInSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold,
  });

  // Set initial and animate positions based on direction
  const getDirectionalAnimations = () => {
    switch (direction) {
      case "up":
        return {
          initial: { opacity: 0, y: 30 },
          animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
        };
      case "down":
        return {
          initial: { opacity: 0, y: -30 },
          animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 },
        };
      case "left":
        return {
          initial: { opacity: 0, x: 30 },
          animate: inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 },
        };
      case "right":
        return {
          initial: { opacity: 0, x: -30 },
          animate: inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 },
        };
      case "none":
        return {
          initial: { opacity: 0 },
          animate: inView ? { opacity: 1 } : { opacity: 0 },
        };
      default:
        return {
          initial: { opacity: 0, y: 30 },
          animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
        };
    }
  };

  const { initial, animate } = getDirectionalAnimations();

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
} 