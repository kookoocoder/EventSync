#!/usr/bin/env python3
"""
Test script for EventSync MCP Server

This script tests the MCP server functionality without requiring a full MCP client.
Run with: python test_mcp_server.py
"""

import asyncio
import json
import sys
import os

# Add current directory to path to import the server
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from mcp_server import eventsync_mcp, list_event, get_event_details
    print("✅ MCP server imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure to install dependencies: pip install mcp")
    sys.exit(1)

async def test_list_events():
    """Test the list_event tool"""
    print("\n🧪 Testing list_event tool...")
    
    # Test 1: List all events
    print("\n📋 Test 1: List all events (limit 5)")
    try:
        result = await list_event(limit=5)
        data = json.loads(result)
        print(f"✅ Found {data['total_events']} events")
        if data['events']:
            print(f"   First event: {data['events'][0]['name']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Filter by event type
    print("\n🎯 Test 2: Filter by hackathon events")
    try:
        result = await list_event(event_type="hackathon", limit=3)
        data = json.loads(result)
        print(f"✅ Found {data['total_events']} hackathon events")
        for event in data['events']:
            print(f"   - {event['name']} ({event['event_type']})")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Filter by status
    print("\n📅 Test 3: Filter by upcoming events")
    try:
        result = await list_event(status="upcoming", limit=3)
        data = json.loads(result)
        print(f"✅ Found {data['total_events']} upcoming events")
        for event in data['events']:
            print(f"   - {event['name']} starts {event['start_date']}")
    except Exception as e:
        print(f"❌ Error: {e}")

async def test_event_details():
    """Test the get_event_details tool"""
    print("\n🔍 Testing get_event_details tool...")
    
    # Test 1: Get details for existing event
    print("\n📖 Test 1: Get details for event ID '1'")
    try:
        result = await get_event_details("1")
        data = json.loads(result)
        if data['success']:
            event = data['event_details']
            print(f"✅ Event details retrieved successfully")
            print(f"   Name: {event['basic_info']['name']}")
            print(f"   Type: {event['basic_info']['event_type']}")
            print(f"   Location: {event['basic_info']['location']}")
            print(f"   Status: {event['schedule']['event_status']}")
            print(f"   Registration: {event['registration']['registration_status']}")
        else:
            print(f"❌ Failed to get event details: {data['error']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Get details for non-existent event
    print("\n🚫 Test 2: Get details for non-existent event ID '999'")
    try:
        result = await get_event_details("999")
        data = json.loads(result)
        if not data.get('success', True) or data.get('error'):  # Handle both error formats
            print(f"✅ Correctly handled non-existent event: {data.get('error', 'Event not found')}")
        else:
            print(f"❌ Unexpected success for non-existent event")
    except Exception as e:
        print(f"❌ Error: {e}")

async def test_database_connection():
    """Test database connectivity"""
    print("\n🔌 Testing database connectivity...")
    
    try:
        events = await eventsync_mcp.get_events_from_db()
        if events:
            print(f"✅ Database connection successful - retrieved {len(events)} events")
            if eventsync_mcp.supabase_client:
                print("   Using Supabase database")
            else:
                print("   Using mock data (Supabase not configured)")
        else:
            print("⚠️  No events found in database")
    except Exception as e:
        print(f"❌ Database connection error: {e}")

def print_test_summary():
    """Print test summary and next steps"""
    print("\n" + "="*60)
    print("🎉 MCP Server Test Summary")
    print("="*60)
    print("✅ If all tests passed, your MCP server is ready!")
    print("\n📋 Next Steps:")
    print("1. Test the actual MCP server: python mcp_server.py")
    print("2. Install in your AI client (Claude Desktop, Cursor, etc.)")
    print("3. Use the tools in your AI conversations!")
    print("\n🔧 Configuration files created:")
    print("   - mcp_server.py (main server)")
    print("   - mcp_requirements.txt (dependencies)")
    print("   - mcp_config.json (configuration)")
    print("   - MCP_README.md (documentation)")
    print("\n🚀 Ready to enhance EventSync with AI capabilities!")

def print_integration_examples():
    """Print integration examples"""
    print("\n📝 Integration Examples:")
    print("\n🔹 Claude Desktop Configuration:")
    print("""
    Add to claude_desktop_config.json:
    {
      "mcpServers": {
        "eventsync": {
          "command": "python",
          "args": ["D:/Users/YRM/Programs/preetam/EventSync/mcp_server.py"]
        }
      }
    }
    """)
    
    print("\n🔹 Cursor IDE Configuration:")
    print("""
    Add to ~/.cursor/mcp.json:
    {
      "mcpServers": {
        "eventsync": {
          "command": "python",
          "args": ["D:/Users/YRM/Programs/preetam/EventSync/mcp_server.py"]
        }
      }
    }
    """)

async def main():
    """Run all tests"""
    print("🚀 EventSync MCP Server Test Suite")
    print("="*50)
    
    # Test database connection first
    await test_database_connection()
    
    # Test the tools
    await test_list_events()
    await test_event_details()
    
    # Print summary and examples
    print_test_summary()
    print_integration_examples()

if __name__ == "__main__":
    asyncio.run(main()) 