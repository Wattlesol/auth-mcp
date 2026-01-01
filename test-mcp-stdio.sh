#!/bin/bash

# Test script for Auth MCP Server (STDIO mode)

echo "🧪 Testing Auth MCP Server (STDIO mode)"
echo "========================================"
echo ""

# Test 1: Initialize
echo "📝 Test 1: Initialize"
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node auth-mcp 2>/dev/null | head -1 | jq .
echo ""

# Test 2: List Tools
echo "📝 Test 2: List Tools"
(
  echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'
  sleep 2
  echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
  sleep 1
) | timeout 5 node auth-mcp 2>/dev/null | grep -A 1000 '"id":2' | head -1 | jq '.result.tools | length'
echo ""

# Test 3: Call authenticate_user tool
echo "📝 Test 3: Call authenticate_user tool"
(
  echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'
  sleep 2
  echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"authenticate_user","arguments":{"email":"test@example.com","password":"password123"}}}'
  sleep 2
) | timeout 8 node auth-mcp 2>/dev/null | grep -A 1000 '"id":3' | head -1 | jq .
echo ""

echo "✅ Tests completed!"

