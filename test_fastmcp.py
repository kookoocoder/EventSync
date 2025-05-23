#!/usr/bin/env python3
"""
Simple FastMCP test to debug the server issue
"""

import sys
import traceback

try:
    print("1. Importing FastMCP...")
    from mcp.server.fastmcp import FastMCP
    print("✅ FastMCP imported successfully")
    
    print("2. Creating FastMCP instance...")
    mcp = FastMCP("TestServer")
    print("✅ FastMCP instance created")
    
    print("3. Adding a simple tool...")
    @mcp.tool()
    def test_tool() -> str:
        """A simple test tool"""
        return "Hello from test tool!"
    print("✅ Tool added successfully")
    
    print("4. Attempting to run server...")
    print("   (This should start the server - press Ctrl+C to stop)")
    mcp.run()
    
except KeyboardInterrupt:
    print("\n👋 Server stopped by user")
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nFull traceback:")
    traceback.print_exc() 