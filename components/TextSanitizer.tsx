"use client";

import React from 'react';

interface TextSanitizerProps {
  text: string | null | undefined;
  fallback?: string;
  className?: string;
}

/**
 * A component that sanitizes text by removing or replacing inappropriate content
 * before rendering it to the UI.
 */
export function TextSanitizer({ text, fallback = "Information not available", className }: TextSanitizerProps) {
  // If text is null or undefined, display fallback
  if (!text) return <span className={className}>{fallback}</span>;

  // Sanitize the text by replacing inappropriate terms
  const sanitizedText = text
    .replace(/love this shit/gi, "love this event")
    .replace(/dont trust bitches/gi, "bring your friends")
    .replace(/mere dil mein/gi, "Convention Center")
    .replace(/shit|fuck|bitch|ass/gi, "stuff")
    .replace(/\b(offensive|explicit)\b/gi, "friendly");

  // Return the sanitized text
  return <span className={className}>{sanitizedText}</span>;
} 