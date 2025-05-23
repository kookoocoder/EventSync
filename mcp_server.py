#!/usr/bin/env python3
"""
EventSync MCP Server

This MCP server provides access to EventSync event data through two main tools:
- list_event: Lists all events with filtering options
- get_event_details: Gets detailed information about a specific event

The server works remotely and can be used with GenAI SDK, OpenAI, or any MCP-compatible AI client.
"""

import os
import sys
import json
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("[OK] Environment variables loaded from .env file")
except ImportError:
    print("[WARN] python-dotenv not available. Using system environment variables.")

# Add the project root to Python path to import from existing modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import mcp.types as types
    MCP_AVAILABLE = True
    print("[OK] MCP package imported successfully")
except ImportError as e:
    print(f"Error: MCP not installed correctly. Error: {e}")
    print("Please install with: pip install mcp")
    sys.exit(1)

# Try to import Supabase client for direct database access
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
    print("[OK] Supabase package available")
except ImportError:
    SUPABASE_AVAILABLE = False
    print("[WARN] Supabase not available. Using mock data for demonstration.")

# Mock event data for demonstration when Supabase is not available
MOCK_EVENTS = [
    {
        "id": "1",
        "name": "Tech Innovation Summit 2025",
        "description": "A premier technology conference featuring the latest innovations in AI, blockchain, and web development.",
        "start_date": "2025-03-15T09:00:00Z",
        "end_date": "2025-03-17T18:00:00Z",
        "location": "San Francisco Convention Center",
        "registration_fee": 299.99,
        "max_team_size": 5,
        "current_participants": 150,
        "registration_end_date": "2025-03-10T23:59:59Z",
        "is_published": True,
        "prize_money": "$50,000",
        "banner_image": "https://example.com/tech-summit-banner.jpg",
        "event_type": "conference",
        "min_team_size": 1,
        "requirements": "Basic programming knowledge, laptop required",
        "rules": "Team collaboration allowed, original work only",
        "registration_start_date": "2025-01-15T00:00:00Z",
        "results_announcement_date": "2025-03-20T15:00:00Z"
    },
    {
        "id": "2", 
        "name": "AI Hackathon Winter 2025",
        "description": "48-hour hackathon focused on artificial intelligence and machine learning solutions for social good.",
        "start_date": "2025-02-20T18:00:00Z",
        "end_date": "2025-02-22T18:00:00Z",
        "location": "Virtual Event",
        "registration_fee": 0,
        "max_team_size": 4,
        "current_participants": 89,
        "registration_end_date": "2025-02-18T23:59:59Z",
        "is_published": True,
        "prize_money": "$25,000",
        "banner_image": "https://example.com/ai-hackathon-banner.jpg",
        "event_type": "hackathon",
        "min_team_size": 2,
        "requirements": "AI/ML experience preferred, development environment setup required",
        "rules": "Open source submissions encouraged, judged on innovation and impact",
        "registration_start_date": "2025-01-10T00:00:00Z",
        "results_announcement_date": "2025-02-25T12:00:00Z"
    },
    {
        "id": "3",
        "name": "Blockchain Developer Workshop",
        "description": "Hands-on workshop covering smart contract development, DeFi protocols, and Web3 integration.",
        "start_date": "2025-04-05T10:00:00Z",
        "end_date": "2025-04-05T17:00:00Z",
        "location": "New York Tech Hub",
        "registration_fee": 150.00,
        "max_team_size": 1,
        "current_participants": 25,
        "registration_end_date": "2025-04-02T23:59:59Z",
        "is_published": True,
        "prize_money": "Certificate of completion",
        "banner_image": "https://example.com/blockchain-workshop-banner.jpg",
        "event_type": "workshop",
        "min_team_size": 1,
        "requirements": "Basic Solidity knowledge, laptop with development tools",
        "rules": "Individual participation only, hands-on coding exercises",
        "registration_start_date": "2025-02-01T00:00:00Z",
        "results_announcement_date": "2025-04-05T17:30:00Z"
    }
]

class EventSyncMCP:
    """EventSync MCP Server implementation"""
    
    def __init__(self):
        self.supabase_client: Optional[Client] = None
        self._initialize_supabase()
    
    def _initialize_supabase(self):
        """Initialize Supabase client if available and configured"""
        if not SUPABASE_AVAILABLE:
            print("[WARN] Supabase not available. Using mock data.")
            return
        
        try:
            # Try to get from environment variables (including .env file if loaded)
            supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
            supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
            
            if supabase_url and supabase_key and supabase_url != 'your_supabase_url_here':
                self.supabase_client = create_client(supabase_url, supabase_key)
                print("[OK] Supabase client initialized successfully from environment variables")
            else:
                print("[WARN] Supabase environment variables not found or contain default values.")
                print("   Create a .env file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
                print("   Using mock data for demonstration.")
        except Exception as e:
            print(f"[WARN] Failed to initialize Supabase client: {e}. Using mock data.")
    
    async def get_events_from_db(self, event_type: Optional[str] = None, 
                                status: Optional[str] = None, 
                                limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get events from Supabase database"""
        if not self.supabase_client:
            events = MOCK_EVENTS[:limit] if limit else MOCK_EVENTS
            
            # Apply filtering for mock data
            if event_type:
                events = [e for e in events if e.get('event_type') == event_type]
            
            if status:
                now = datetime.utcnow()
                filtered_events = []
                for event in events:
                    try:
                        start_date = datetime.fromisoformat(event.get("start_date", "").replace('Z', '+00:00'))
                        end_date = datetime.fromisoformat(event.get("end_date", "").replace('Z', '+00:00'))
                        
                        if status == 'upcoming' and now < start_date:
                            filtered_events.append(event)
                        elif status == 'live' and start_date <= now <= end_date:
                            filtered_events.append(event)
                        elif status == 'past' and now > end_date:
                            filtered_events.append(event)
                    except ValueError:
                        # Skip events with invalid dates
                        continue
                events = filtered_events
            
            return events[:limit] if limit else events
        
        try:
            query = self.supabase_client.table('events').select('*').eq('is_published', True)
            
            if event_type:
                query = query.eq('event_type', event_type)
            
            # Filter by status (upcoming, live, past)
            if status:
                now = datetime.utcnow().isoformat()
                if status == 'upcoming':
                    query = query.gte('start_date', now)
                elif status == 'live':
                    query = query.lte('start_date', now).gte('end_date', now)
                elif status == 'past':
                    query = query.lt('end_date', now)
            
            if limit:
                query = query.limit(limit)
            
            query = query.order('start_date', desc=False)
            
            response = query.execute()
            return response.data or []
        
        except Exception as e:
            print(f"Database error: {e}")
            return MOCK_EVENTS[:limit] if limit else MOCK_EVENTS
    
    async def get_event_by_id_from_db(self, event_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific event by ID from database"""
        if not self.supabase_client:
            # Return mock data
            for event in MOCK_EVENTS:
                if str(event['id']) == str(event_id):
                    return event
            return None
        
        try:
            response = self.supabase_client.table('events').select('*').eq('id', event_id).execute()
            return response.data[0] if response.data else None
        
        except Exception as e:
            print(f"Database error: {e}")
            # Fallback to mock data
            for event in MOCK_EVENTS:
                if str(event['id']) == str(event_id):
                    return event
            return None

# Initialize EventSync MCP instance
eventsync_mcp = EventSyncMCP()

async def list_event(
    event_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: Optional[int] = 10
) -> str:
    """
    List events from EventSync platform with optional filtering.
    
    Args:
        event_type: Filter by event type (e.g., 'hackathon', 'conference', 'workshop'). Optional.
        status: Filter by status - 'upcoming', 'live', or 'past'. Optional.
        limit: Maximum number of events to return (default: 10). Optional.
    
    Returns:
        JSON string containing a list of events with basic information.
    """
    try:
        events = await eventsync_mcp.get_events_from_db(event_type, status, limit)
        
        # Format events for response
        formatted_events = []
        for event in events:
            formatted_event = {
                "id": event.get("id"),
                "name": event.get("name"),
                "description": event.get("description", "")[:200] + "..." if len(event.get("description", "")) > 200 else event.get("description", ""),
                "start_date": event.get("start_date"),
                "end_date": event.get("end_date"),
                "location": event.get("location"),
                "event_type": event.get("event_type"),
                "registration_fee": event.get("registration_fee"),
                "current_participants": event.get("current_participants"),
                "max_team_size": event.get("max_team_size"),
                "registration_end_date": event.get("registration_end_date")
            }
            formatted_events.append(formatted_event)
        
        response = {
            "total_events": len(formatted_events),
            "filters_applied": {
                "event_type": event_type,
                "status": status,
                "limit": limit
            },
            "events": formatted_events
        }
        
        return json.dumps(response, indent=2)
    
    except Exception as e:
        error_response = {
            "error": f"Failed to retrieve events: {str(e)}",
            "total_events": 0,
            "events": []
        }
        return json.dumps(error_response, indent=2)

async def get_event_details(event_id: str) -> str:
    """
    Get detailed information about a specific event by its ID.
    
    Args:
        event_id: The unique identifier of the event to retrieve details for.
    
    Returns:
        JSON string containing complete event details including requirements, rules, 
        prize information, and registration details.
    """
    try:
        event = await eventsync_mcp.get_event_by_id_from_db(event_id)
        
        if not event:
            error_response = {
                "error": f"Event with ID '{event_id}' not found",
                "event_id": event_id,
                "event_details": None
            }
            return json.dumps(error_response, indent=2)
        
        # Calculate registration status
        now = datetime.utcnow()
        registration_status = "unknown"
        event_status = "unknown"
        
        try:
            reg_start = datetime.fromisoformat(event.get("registration_start_date", "").replace('Z', '+00:00')) if event.get("registration_start_date") else None
            reg_end = datetime.fromisoformat(event.get("registration_end_date", "").replace('Z', '+00:00')) if event.get("registration_end_date") else None
            event_start = datetime.fromisoformat(event.get("start_date", "").replace('Z', '+00:00')) if event.get("start_date") else None
            event_end = datetime.fromisoformat(event.get("end_date", "").replace('Z', '+00:00')) if event.get("end_date") else None
            
            # Convert now to timezone-aware datetime for comparison
            from datetime import timezone
            now = now.replace(tzinfo=timezone.utc)
            
            if reg_start and reg_end:
                if now < reg_start:
                    registration_status = "not_started"
                elif reg_start <= now <= reg_end:
                    registration_status = "open"
                else:
                    registration_status = "closed"
            
            if event_start and event_end:
                if now < event_start:
                    event_status = "upcoming"
                elif event_start <= now <= event_end:
                    event_status = "live"
                else:
                    event_status = "past"
        except (ValueError, AttributeError) as e:
            # If date parsing fails, keep default "unknown" status
            print(f"Warning: Failed to parse dates for event {event_id}: {e}")
        
        detailed_event = {
            "event_id": event.get("id"),
            "basic_info": {
                "name": event.get("name"),
                "description": event.get("description"),
                "event_type": event.get("event_type"),
                "location": event.get("location"),
                "banner_image": event.get("banner_image")
            },
            "schedule": {
                "start_date": event.get("start_date"),
                "end_date": event.get("end_date"),
                "registration_start_date": event.get("registration_start_date"),
                "registration_end_date": event.get("registration_end_date"),
                "results_announcement_date": event.get("results_announcement_date"),
                "event_status": event_status
            },
            "registration": {
                "registration_fee": event.get("registration_fee"),
                "current_participants": event.get("current_participants"),
                "registration_status": registration_status,
                "is_published": event.get("is_published")
            },
            "team_info": {
                "min_team_size": event.get("min_team_size"),
                "max_team_size": event.get("max_team_size")
            },
            "details": {
                "requirements": event.get("requirements"),
                "rules": event.get("rules"),
                "prize_money": event.get("prize_money")
            }
        }
        
        response = {
            "success": True,
            "event_details": detailed_event
        }
        
        return json.dumps(response, indent=2)
    
    except Exception as e:
        error_response = {
            "success": False,
            "error": f"Failed to retrieve event details: {str(e)}",
            "event_id": event_id,
            "event_details": None
        }
        return json.dumps(error_response, indent=2)

def main():
    """Main function to run the MCP server"""
    print("[START] Starting EventSync MCP Server...")
    print("[TOOLS] Available tools: list_event, get_event_details")
    print("[READY] Ready for remote AI client connections")
    
    # Simple stdio-based MCP server implementation
    async def run_server():
        """Run a simple stdio-based MCP server"""
        try:
            print("[SERVER] MCP Server running in stdio mode...", file=sys.stderr)
            
            while True:
                try:
                    # Read line from stdin
                    line = sys.stdin.readline()
                    if not line:
                        break
                    
                    # Parse JSON message
                    try:
                        message = json.loads(line.strip())
                    except json.JSONDecodeError:
                        continue
                    
                    # Handle initialize request
                    if message.get("method") == "initialize":
                        response = {
                            "jsonrpc": "2.0",
                            "id": message.get("id"),
                            "result": {
                                "protocolVersion": "2024-11-05",
                                "capabilities": {
                                    "tools": {},
                                    "logging": {}
                                },
                                "serverInfo": {
                                    "name": "eventsync",
                                    "version": "1.0.0"
                                }
                            }
                        }
                        print(json.dumps(response), flush=True)
                    
                    # Handle list tools request
                    elif message.get("method") == "tools/list":
                        tools = [
                            {
                                "name": "list_event",
                                "description": "List events from EventSync platform with optional filtering",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "event_type": {
                                            "type": "string",
                                            "description": "Filter by event type (hackathon, conference, workshop)"
                                        },
                                        "status": {
                                            "type": "string",
                                            "description": "Filter by status (upcoming, live, past)"
                                        },
                                        "limit": {
                                            "type": "integer",
                                            "description": "Maximum number of events to return",
                                            "default": 10
                                        }
                                    }
                                }
                            },
                            {
                                "name": "get_event_details",
                                "description": "Get detailed information about a specific event by ID",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "event_id": {
                                            "type": "string",
                                            "description": "Unique identifier of the event"
                                        }
                                    },
                                    "required": ["event_id"]
                                }
                            }
                        ]
                        
                        response = {
                            "jsonrpc": "2.0",
                            "id": message.get("id"),
                            "result": {"tools": tools}
                        }
                        print(json.dumps(response), flush=True)
                    
                    # Handle tool call request
                    elif message.get("method") == "tools/call":
                        params = message.get("params", {})
                        tool_name = params.get("name")
                        arguments = params.get("arguments", {})
                        
                        try:
                            if tool_name == "list_event":
                                result = await list_event(
                                    arguments.get("event_type"),
                                    arguments.get("status"),
                                    arguments.get("limit", 10)
                                )
                            elif tool_name == "get_event_details":
                                result = await get_event_details(arguments.get("event_id"))
                            else:
                                result = json.dumps({"error": f"Unknown tool: {tool_name}"})
                            
                            response = {
                                "jsonrpc": "2.0",
                                "id": message.get("id"),
                                "result": {
                                    "content": [{"type": "text", "text": result}]
                                }
                            }
                        except Exception as e:
                            response = {
                                "jsonrpc": "2.0",
                                "id": message.get("id"),
                                "error": {
                                    "code": -32000,
                                    "message": f"Tool execution error: {str(e)}"
                                }
                            }
                        
                        print(json.dumps(response), flush=True)
                
                except KeyboardInterrupt:
                    break
                except Exception as e:
                    print(f"Error: {e}", file=sys.stderr)
                    
        except Exception as e:
            print(f"Server error: {e}", file=sys.stderr)
    
    try:
        asyncio.run(run_server())
    except KeyboardInterrupt:
        print("\n👋 EventSync MCP Server stopped")

if __name__ == "__main__":
    main() 