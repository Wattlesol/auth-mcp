#!/bin/bash

# Test script for authentication flow with token management
# Tests: signin -> get profile -> signout

echo "🧪 Testing Auth MCP Server - Token Management"
echo "=============================================="
echo ""

# Test 1: Sign in with credentials
echo "📝 Test 1: Signing in with credentials..."
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"post_api_auth_signin","arguments":{"email":"irfan@mailinator.com","password":"Muh@mm@d9091"}}}' | MCP_DEBUG=true node auth-mcp 2>&1 | grep -A 20 '"id":2'

echo ""
echo "=============================================="
echo ""

# Test 2: Get user profile (should use stored token)
echo "📝 Test 2: Getting user profile with stored token..."
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"post_api_auth_signin","arguments":{"email":"irfan@mailinator.com","password":"Muh@mm@d9091"}}}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_api_auth_me","arguments":{}}}' | MCP_DEBUG=true node auth-mcp 2>&1 | grep -A 20 '"id":3'

echo ""
echo "=============================================="
echo ""

# Test 3: Try to get profile without signing in (should fail)
echo "📝 Test 3: Trying to get profile without authentication (should fail)..."
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_api_auth_me","arguments":{}}}' | MCP_DEBUG=true node auth-mcp 2>&1 | grep -A 10 '"id":2'

echo ""
echo "=============================================="
echo ""
echo "✅ Tests completed!"

