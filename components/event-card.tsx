"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"

interface EventCardProps {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  bannerImage: string
  registrationFee: number
  organizerName: string
  isOrganizer?: boolean
}

export function EventCard({
  id,
  title,
  description,
  startDate,
  endDate,
  location,
  bannerImage,
  registrationFee,
  organizerName,
  isOrganizer = false,
}: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const formattedStartDate = new Date(startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
  
  const formattedEndDate = new Date(endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 ${isHovered ? 'shadow-lg transform -translate-y-1' : 'shadow'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 w-full">
        <Image
          src={bannerImage || "https://placehold.co/600x400?text=Hackathon"}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          {registrationFee === 0 ? (
            <Badge className="bg-green-500">Free</Badge>
          ) : (
            <Badge>${registrationFee}</Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          by {organizerName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pb-0">
        <p className="line-clamp-2 text-sm text-muted-foreground mb-3">
          {description}
        </p>
        
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {formattedStartDate} - {formattedEndDate}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{location}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-4 flex justify-between items-center">
        {isOrganizer ? (
          <div className="w-full flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/organizer/dashboard/${id}`}>Manage</Link>
            </Button>
          </div>
        ) : (
          <div className="w-full flex gap-2">
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/hackathons/${id}`}>Details</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href={`/hackathons/${id}/register`}>Register</Link>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
} 