# EventSync MCP Server 🚀

A Model Context Protocol (MCP) server for the EventSync platform that provides AI assistants with access to event data through two powerful tools.

## 🎯 Overview

This MCP server enables AI assistants (like Claude, OpenAI GPT, or any MCP-compatible client) to interact with your EventSync platform remotely. The server provides standardized access to event information without breaking any existing project code.

### ✨ Features

- **🔍 List Events**: Browse events with flexible filtering options
- **📋 Event Details**: Get comprehensive information about specific events  
- **🌐 Remote Access**: Works with any MCP-compatible AI client
- **🔄 Fallback Support**: Uses mock data when database is unavailable
- **⚡ Fast Setup**: Ready to use with minimal configuration
- **🛡️ Error Handling**: Robust error handling with meaningful responses
- **🔐 Environment Variables**: Secure configuration using .env files

## 🛠️ Available Tools

### 1. `list_event`
Lists events from the EventSync platform with optional filtering.

**Parameters:**
- `event_type` (optional): Filter by type - `hackathon`, `conference`, `workshop`
- `status` (optional): Filter by status - `upcoming`, `live`, `past`  
- `limit` (optional): Maximum events to return (default: 10)

**Example Usage:**
```json
{
  "tool": "list_event",
  "parameters": {
    "event_type": "hackathon",
    "status": "upcoming", 
    "limit": 5
  }
}
```

### 2. `get_event_details`
Retrieves detailed information about a specific event by ID.

**Parameters:**
- `event_id` (required): Unique identifier of the event

**Example Usage:**
```json
{
  "tool": "get_event_details",
  "parameters": {
    "event_id": "1"
  }
}
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install MCP server dependencies
pip install -r mcp_requirements.txt
```

### 2. Environment Setup (.env File)

Create a `.env` file in your project root:

```bash
# Copy the example file
cp example.env .env
```

Edit the `.env` file with your actual Supabase credentials:

```bash
# EventSync MCP Server Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: MCP Server Configuration
MCP_DEBUG=false
```

**Note**: If you don't create a `.env` file or leave the values as defaults, the server will automatically use mock data for demonstration.

### 3. Test the Server

```bash
# Test using the test script
python test_mcp_server.py

# Test server import
python -c "import mcp_server; print('✅ Server ready!')"
```

### 4. Debug with MCP Inspector

```bash
# Open MCP Inspector for testing
mcp dev mcp_server.py
```

## 🔧 Client Integration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "eventsync": {
      "command": "python",
      "args": ["/absolute/path/to/your/project/mcp_server.py"]
    }
  }
}
```

**Note**: Environment variables are loaded automatically from the `.env` file in the project directory.

### Cursor IDE  

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "eventsync": {
      "command": "python",
      "args": ["/absolute/path/to/your/project/mcp_server.py"]
    }
  }
}
```

### OpenAI/GenAI SDK

```python
from mcp.client import MCPClient

# Connect to the MCP server
client = MCPClient()
await client.connect("stdio", command=["python", "mcp_server.py"])

# Use the tools
result = await client.call_tool("list_event", {
    "event_type": "hackathon",
    "status": "upcoming"
})
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Client     │    │   MCP Server     │    │   EventSync     │
│  (Claude/GPT)   │◄──►│  (mcp_server.py) │◄──►│   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          ▲
                              ▼                          │
                       ┌──────────────────┐              │
                       │   .env File      │──────────────┘
                       │  (Supabase Keys) │
                       └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Mock Data      │
                       │  (if no .env)    │
                       └──────────────────┘
```

## 📊 Example Responses

### List Events Response
```json
{
  "total_events": 2,
  "filters_applied": {
    "event_type": "hackathon",
    "status": "upcoming",
    "limit": 10
  },
  "events": [
    {
      "id": "2",
      "name": "AI Hackathon Winter 2025",
      "description": "48-hour hackathon focused on artificial intelligence...",
      "start_date": "2025-02-20T18:00:00Z",
      "end_date": "2025-02-22T18:00:00Z",
      "location": "Virtual Event",
      "event_type": "hackathon",
      "registration_fee": 0,
      "current_participants": 89,
      "max_team_size": 4,
      "registration_end_date": "2025-02-18T23:59:59Z"
    }
  ]
}
```

### Event Details Response
```json
{
  "success": true,
  "event_details": {
    "event_id": "2",
    "basic_info": {
      "name": "AI Hackathon Winter 2025",
      "description": "48-hour hackathon focused on artificial intelligence and machine learning solutions for social good.",
      "event_type": "hackathon",
      "location": "Virtual Event",
      "banner_image": "https://example.com/ai-hackathon-banner.jpg"
    },
    "schedule": {
      "start_date": "2025-02-20T18:00:00Z",
      "end_date": "2025-02-22T18:00:00Z",
      "registration_start_date": "2025-01-10T00:00:00Z",
      "registration_end_date": "2025-02-18T23:59:59Z",
      "results_announcement_date": "2025-02-25T12:00:00Z",
      "event_status": "upcoming"
    },
    "registration": {
      "registration_fee": 0,
      "current_participants": 89,
      "registration_status": "open",
      "is_published": true
    },
    "team_info": {
      "min_team_size": 2,
      "max_team_size": 4
    },
    "details": {
      "requirements": "AI/ML experience preferred, development environment setup required",
      "rules": "Open source submissions encouraged, judged on innovation and impact",
      "prize_money": "$25,000"
    }
  }
}
```

## 🧪 Testing

### Manual Testing

```bash
# Test list_event tool
python -c "
import asyncio
import sys
sys.path.append('.')
from mcp_server import eventsync_mcp
result = asyncio.run(eventsync_mcp.get_events_from_db())
print(f'Found {len(result)} events')
"

# Test get_event_details tool  
python -c "
import asyncio
import sys
sys.path.append('.')
from mcp_server import eventsync_mcp
result = asyncio.run(eventsync_mcp.get_event_by_id_from_db('1'))
print(f'Event: {result['name'] if result else 'Not found'}')
"
```

### Using MCP Inspector

1. Start the inspector: `mcp dev mcp_server.py`
2. Open the web interface (usually `http://localhost:3000`)
3. Test both tools with different parameters
4. Verify JSON responses

## 🔍 Troubleshooting

### Common Issues

**❌ "MCP not installed" error**
```bash
pip install "mcp[cli]"
```

**❌ "Supabase not available" warning**
- This is normal if you don't have a `.env` file configured
- The server will use mock data automatically
- Create a `.env` file with your Supabase credentials to use real data

**❌ Server not appearing in client**
- Check file permissions: `chmod +x mcp_server.py` (Linux/Mac)
- Verify absolute paths in configuration
- Restart your AI client after configuration changes

**❌ Database connection issues**
- Verify your `.env` file has correct Supabase URL and API key
- Check network connectivity
- Server will fallback to mock data automatically

**❌ "Environment variables not found" message**
- Create a `.env` file in your project root
- Copy from `example.env` and fill in your actual Supabase credentials
- The server will show "Using mock data" if `.env` is not configured

### Debug Mode

Add debug logging by setting environment variable in your `.env` file:
```bash
MCP_DEBUG=true
```

## 📋 Requirements

- Python 3.8+
- MCP (`mcp[cli]`)
- python-dotenv (for .env file support)
- Supabase (optional - for database connectivity)
- Your existing EventSync project (unchanged)

## 🔐 Security Notes

- Store your Supabase credentials in the `.env` file, not in code
- Add `.env` to your `.gitignore` file to avoid committing secrets
- Use environment-specific `.env` files for different deployments
- The `example.env` file shows the required format without actual secrets

## 🤝 Contributing

This MCP server is designed to work alongside your existing EventSync project without modifications. To extend functionality:

1. Add new tools by creating functions and registering them in the server
2. Follow the existing pattern for database/mock data handling
3. Update the configuration file with new tool definitions
4. Test thoroughly with MCP Inspector

## 📄 License

This MCP server follows the same license as your EventSync project.

## 🆘 Support

- Check the [MCP documentation](https://modelcontextprotocol.io/) for protocol details
- Review `.env` file configuration if database connection fails
- For EventSync-specific questions, refer to your project documentation

---

**🎉 Ready to enhance your EventSync platform with AI capabilities using secure .env configuration!** 