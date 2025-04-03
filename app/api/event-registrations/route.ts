import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, EventRegistration } from "@/lib/mock-db"
import { authOptions } from "../auth/[...nextauth]/route"

// Get event registrations for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (eventId) {
      // Find specific registration for user and event
      const registration = await db.eventRegistration.findByUserAndEvent({
        userId: session.user.id,
        eventId
      })

      if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 })
      }

      return NextResponse.json(registration)
    } else {
      // Get all registrations for current user
      const userRegistrations = await db.eventRegistration.findByUser({
        userId: session.user.id
      })
      
      return NextResponse.json(userRegistrations)
    }
  } catch (error) {
    console.error("[EVENT_REGISTRATIONS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new event registration
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body;
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { 
      eventId, 
      name, 
      email, 
      mobile, 
      college, 
      branch, 
      department, 
      address,
      paymentProof
    } = body

    if (!eventId || !name || !email || !mobile || !college) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the event exists
    const event = await db.event.findUnique({ where: { id: eventId } })
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user already registered for this event
    const existingRegistration = await db.eventRegistration.findByUserAndEvent({
      userId: session.user.id,
      eventId
    })

    if (existingRegistration) {
      return NextResponse.json({ error: "You are already registered for this event" }, { status: 400 })
    }

    // Create new registration
    const newRegistration = await db.eventRegistration.create({
      data: {
        userId: session.user.id,
        eventId,
        name,
        email,
        mobile,
        college,
        branch: branch || "",
        department: department || "",
        address: address || "",
        paymentStatus: "Pending Verification",
        paymentProof: paymentProof || undefined
      }
    })

    return NextResponse.json(newRegistration)
  } catch (error) {
    console.error("[EVENT_REGISTRATIONS_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 