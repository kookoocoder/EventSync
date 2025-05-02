"use client";

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimalPlaces?: number;
}

export function AnimatedCounter({ 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '',
  className = '',
  decimalPlaces = 0
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const startTime = useRef<number | null>(null);
  const endValue = useRef(end);
  
  // Easing function for smoother animation
  const easeOutQuad = (t: number) => t * (2 - t);
  
  useEffect(() => {
    endValue.current = end;
    
    if (inView) {
      startTime.current = null;
      
      const animate = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp;
        const progress = Math.min((timestamp - startTime.current) / duration, 1);
        const easedProgress = easeOutQuad(progress);
        
        setCount(easedProgress * endValue.current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [inView, end, duration]);
  
  // Format the number with commas and decimal places
  const formattedCount = count.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });
  
  return (
    <span ref={ref} className={className}>
      {prefix}{formattedCount}{suffix}
    </span>
  );
} 