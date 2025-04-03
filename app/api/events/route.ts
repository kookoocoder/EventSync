import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/mock-db"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    console.log(`[Events API] GET request received${eventId ? ` for event ID: ${eventId}` : ' for all events'}`)

    if (eventId) {
      // Fetch a specific event
      console.log(`[Events API] Looking for event with ID: ${eventId}`)
      const event = await db.event.findUnique({ where: { id: eventId } })
      
      if (!event) {
        console.error(`[Events API] Event with ID: ${eventId} not found`)
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }
      
      console.log(`[Events API] Found event: ${event.title}`)
      
      // Return the event with proper date formatting
      const formattedEvent = {
        ...event,
        date: event.date.toISOString(),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString()
      }
      
      return NextResponse.json(formattedEvent)
    }

    // Fetch all events
    console.log('[Events API] Fetching all events')
    const events = await db.event.findMany();
    
    // Format dates for all events
    const formattedEvents = events.map(event => ({
      ...event,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }))
    
    console.log(`[Events API] Returning ${formattedEvents.length} events`)
    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error("[Events API] Error in GET handler:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body;
    try {
      body = await request.json()
    } catch (error) {
      console.error("[EVENTS_POST] Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    
    const { title, description, date, location, category, isLive, image, paymentQR } = body

    if (!title || !description || !date || !location || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const event = await db.event.create({
        data: {
          title,
          description,
          date: new Date(date),
          location,
          category,
          isLive: Boolean(isLive),
          image: image || "/placeholder.svg",
          paymentQR: paymentQR || null
        },
      })

      return NextResponse.json(event)
    } catch (error) {
      console.error("[EVENTS_POST] Error creating event:", error)
      return NextResponse.json({ error: "Event couldn't be created" }, { status: 500 })
    }
  } catch (error) {
    console.error("[EVENTS_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    let body;
    try {
      body = await request.json()
    } catch (error) {
      console.error("[EVENTS_PUT] Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    
    const { title, description, date, location, category, isLive, image, paymentQR } = body

    if (!title || !description || !date || !location || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const event = await db.event.update({
        where: {
          id: eventId,
        },
        data: {
          title,
          description,
          date: new Date(date),
          location,
          category,
          isLive: Boolean(isLive),
          image: image || "/placeholder.svg",
          paymentQR: paymentQR || null
        },
      })

      return NextResponse.json(event)
    } catch (error) {
      console.error("[EVENTS_PUT] Error updating event:", error)
      return NextResponse.json({ error: "Event not found or couldn't be updated" }, { status: 404 })
    }
  } catch (error) {
    console.error("[EVENTS_PUT]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    await db.event.delete({
      where: {
        id: eventId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[EVENTS_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 