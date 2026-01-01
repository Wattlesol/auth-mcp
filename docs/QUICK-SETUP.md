# Auth MCP Server - Quick Setup Guide

## ✅ What You Have Now

A **fast, low-latency, command-based MCP server** that:
- ✨ Works with LM Studio, Claude Desktop, and other MCP clients
- ⚡ Uses stdio for real-time, low-latency communication
- 🔄 Dynamically loads 18 tools from your Swagger API
- 🐳 Can run locally or in Docker

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd /Users/xain/Desktop/mcp
npm install
```

### Step 2: Test the Server

```bash
./test-mcp-stdio.sh
```

You should see:
```
✅ Initialize: Success
✅ List Tools: 18 tools loaded
✅ Call Tool: Working
```

### Step 3: Configure Your AI Agent

Copy the configuration below for your AI agent:

## 📋 Configuration for LM Studio

```json
{
  "mcpServers": {
    "auth-mcp": {
      "command": "node",
      "args": [
        "/Users/xain/Desktop/mcp/auth-mcp"
      ],
      "env": {
        "AUTH_API_BASE_URL": "https://backstage.orcayo.wattlesol.digital",
        "SWAGGER_URL": "https://backstage.orcayo.wattlesol.digital/api-json"
      }
    }
  }
}
```

**Where to add this:**
- Open LM Studio
- Settings → MCP Servers → Add Server
- Paste the configuration above
- Save and restart

## 📋 Configuration for Claude Desktop

```json
{
  "mcpServers": {
    "auth-mcp": {
      "command": "node",
      "args": [
        "/Users/xain/Desktop/mcp/auth-mcp"
      ],
      "env": {
        "AUTH_API_BASE_URL": "https://backstage.orcayo.wattlesol.digital",
        "SWAGGER_URL": "https://backstage.orcayo.wattlesol.digital/api-json"
      }
    }
  }
}
```

**Where to add this:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Add the configuration and restart Claude Desktop

## 🎯 What Tools Are Available?

Your MCP server provides **18 authentication tools**:

1. `authenticate_user` - Login with email/password
2. `validate_token` - Validate JWT tokens
3. `register_user` - Register new users
4. `logout_user` - Logout users
5. `check_permission` - Check permissions
6. `get_user_roles` - Get user roles
7. ... and 12 more from your Swagger API

## 🧪 Test It Works

After configuring your AI agent, try asking:

```
"Can you authenticate a user with email test@example.com and password test123?"
```

The AI should use the `authenticate_user` tool automatically.

## 📁 Important Files

| File | Purpose |
|------|---------|
| `auth-mcp` | Main launcher script |
| `src/mcp-stdio-server.js` | MCP server implementation |
| `lm-studio-config.json` | LM Studio configuration |
| `claude-desktop-config.json` | Claude Desktop configuration |
| `test-mcp-stdio.sh` | Test script |
| `.env` | Environment variables |

## 🔧 Customization

Edit `.env` to change API endpoints:

```env
AUTH_API_BASE_URL=https://your-api.com
SWAGGER_URL=https://your-api.com/swagger.json
```

## 🐳 Docker Option (Optional)

If you prefer Docker:

```bash
# Build
docker build -f Dockerfile.mcp -t auth-mcp-stdio .

# Use this configuration
{
  "mcpServers": {
    "auth-mcp": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "--env-file", "/Users/xain/Desktop/mcp/.env", "auth-mcp-stdio"]
    }
  }
}
```

## ❓ Troubleshooting

**Server not starting?**
```bash
# Check dependencies
npm install

# Make executable
chmod +x auth-mcp

# Test manually
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node auth-mcp
```

**Tools not loading?**
```bash
# Check Swagger URL
curl https://backstage.orcayo.wattlesol.digital/api-json
```

## 📚 More Documentation

- [CONFIGURATION-GUIDE.md](./CONFIGURATION-GUIDE.md) - Detailed setup guide
- [README-MCP.md](./README-MCP.md) - Full MCP documentation
- [MCP-INTEGRATION-GUIDE.md](./MCP-INTEGRATION-GUIDE.md) - Integration examples

## ✨ You're Done!

Your Auth MCP Server is ready to use with AI agents for real-time authentication operations!

