#!/usr/bin/env python3
"""
EventSync MCP Server Setup Script

This script helps you set up and configure the EventSync MCP server
for use with AI clients like Claude Desktop, Cursor, or any MCP-compatible client.
"""

import os
import sys
import json
import subprocess
from pathlib import Path

def install_dependencies():
    """Install MCP dependencies"""
    print("📦 Installing MCP dependencies...")
    try:
        # Install core MCP package
        subprocess.check_call([sys.executable, "-m", "pip", "install", "mcp[cli]"])
        print("✅ MCP installed successfully")
        
        # Install python-dotenv for .env support
        subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dotenv"])
        print("✅ python-dotenv installed successfully")
        
        # Try to install Supabase (optional)
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "supabase"])
            print("✅ Supabase installed successfully")
        except subprocess.CalledProcessError:
            print("⚠️  Supabase installation failed (optional - will use mock data)")
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False
    return True

def setup_env_file():
    """Setup .env file for Supabase configuration"""
    print("\n🔐 Setting up environment configuration...")
    
    env_file = Path(".env")
    example_env_file = Path("example.env")
    
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
    if not example_env_file.exists():
        print("⚠️  example.env file not found. Creating one...")
        return False
    
    # Copy example.env to .env
    try:
        import shutil
        shutil.copy(example_env_file, env_file)
        print("✅ .env file created from example.env")
        print("📝 Please edit .env file with your actual Supabase credentials")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def check_env_configuration():
    """Check if .env file is properly configured"""
    print("\n🔍 Checking environment configuration...")
    
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  No .env file found. Will use mock data.")
        return False
    
    try:
        # Read .env file
        env_content = env_file.read_text()
        
        # Check if it has placeholder values
        if "your_supabase_url_here" in env_content:
            print("⚠️  .env file contains placeholder values")
            print("   Please edit .env with your actual Supabase URL and API key")
            print("   Server will use mock data until configured")
            return False
        
        # Check if required variables exist
        lines = env_content.split('\n')
        has_url = any(line.startswith('NEXT_PUBLIC_SUPABASE_URL=') and '=' in line and line.split('=', 1)[1].strip() for line in lines)
        has_key = any(line.startswith('NEXT_PUBLIC_SUPABASE_ANON_KEY=') and '=' in line and line.split('=', 1)[1].strip() for line in lines)
        
        if has_url and has_key:
            print("✅ .env file is properly configured")
            return True
        else:
            print("⚠️  .env file is missing required variables")
            print("   Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
            return False
            
    except Exception as e:
        print(f"❌ Error reading .env file: {e}")
        return False

def test_server():
    """Test the MCP server"""
    print("\n🧪 Testing MCP Server...")
    try:
        subprocess.check_call([sys.executable, "test_mcp_server.py"])
        return True
    except subprocess.CalledProcessError:
        print("❌ Server test failed")
        return False

def generate_config_templates():
    """Generate configuration templates for different AI clients"""
    print("\n📝 Generating configuration templates...")
    
    # Get absolute path to the server
    server_path = str(Path(__file__).parent.absolute() / "mcp_server.py")
    
    # Claude Desktop configuration (no env vars needed - uses .env file)
    claude_config = {
        "mcpServers": {
            "eventsync": {
                "command": "python",
                "args": [server_path]
            }
        }
    }
    
    # Cursor configuration (no env vars needed - uses .env file)
    cursor_config = {
        "mcpServers": {
            "eventsync": {
                "command": "python", 
                "args": [server_path]
            }
        }
    }
    
    # Write configurations
    with open("claude_desktop_config.json", "w") as f:
        json.dump(claude_config, f, indent=2)
    
    with open("cursor_mcp_config.json", "w") as f:
        json.dump(cursor_config, f, indent=2)
    
    print("✅ Configuration templates created:")
    print(f"   - claude_desktop_config.json")
    print(f"   - cursor_mcp_config.json")
    
    return server_path

def print_setup_instructions(server_path, env_configured):
    """Print setup instructions for different clients"""
    print("\n" + "="*60)
    print("🎉 EventSync MCP Server Setup Complete!")
    print("="*60)
    
    print("\n📋 Next Steps:")
    print("1. Choose your AI client and follow the instructions below")
    if not env_configured:
        print("2. Configure your .env file for real Supabase data (optional)")
        print("3. Start using EventSync tools in your AI conversations!")
    else:
        print("2. Start using EventSync tools in your AI conversations!")
    
    print("\n🔧 Claude Desktop Setup:")
    print("1. Open your Claude Desktop configuration file:")
    print("   - Windows: %APPDATA%\\Claude\\claude_desktop_config.json")
    print("   - macOS: ~/Library/Application Support/Claude/claude_desktop_config.json")
    print("2. Copy the contents of 'claude_desktop_config.json' to your Claude config")
    print("3. Restart Claude Desktop")
    
    print("\n🔧 Cursor IDE Setup:")
    print("1. Create or edit: ~/.cursor/mcp.json")
    print("2. Copy the contents of 'cursor_mcp_config.json' to your Cursor config")
    print("3. Restart Cursor")
    
    if not env_configured:
        print("\n🔐 Environment Configuration (Optional):")
        print("Edit the .env file with your actual Supabase credentials:")
        print("1. Open .env file in your text editor")
        print("2. Replace placeholder values with actual Supabase URL and API key")
        print("3. Save the file and restart the MCP server")
        print("Note: Server will use mock data if .env is not configured")
    
    print("\n🚀 Available Tools:")
    print("- list_event: List events with filtering options")
    print("- get_event_details: Get detailed information about specific events")
    
    print("\n📖 Example AI Prompts:")
    print('- "List all upcoming hackathons"')
    print('- "Show me details about event ID 1"')
    print('- "What conferences are happening this month?"')
    
    print(f"\n📁 Server Path: {server_path}")

def main():
    """Main setup function"""
    print("🚀 EventSync MCP Server Setup")
    print("="*40)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Setup .env file
    setup_env_file()
    
    # Check environment configuration
    env_configured = check_env_configuration()
    
    # Test server
    if not test_server():
        print("⚠️  Server tests failed, but you can still continue with setup")
    
    # Generate configurations
    server_path = generate_config_templates()
    
    # Print instructions
    print_setup_instructions(server_path, env_configured)
    
    print(f"\n✅ Setup complete! Your EventSync MCP server is ready to use.")
    if not env_configured:
        print("💡 Tip: Configure your .env file for real database access")

if __name__ == "__main__":
    main() 