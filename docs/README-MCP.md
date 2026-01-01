# Auth MCP Server - Command-Based (STDIO)

Fast, low-latency MCP server optimized for real-time AI conversations.

## 🚀 Quick Start

### Option 1: Run Locally (Recommended for Development)

```bash
# Install dependencies
npm install

# Run the MCP server
node auth-mcp
```

### Option 2: Run with Docker (Recommended for Production)

```bash
# Build the Docker image
docker build -f Dockerfile.mcp -t auth-mcp-stdio .

# Run the container
docker run --rm -i --env-file .env auth-mcp-stdio
```

## 📋 Configuration for AI Agents

### LM Studio Configuration

Add this to your LM Studio MCP servers configuration:

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

**Location:**
- macOS: `~/Library/Application Support/LM Studio/mcp_config.json`
- Windows: `%APPDATA%\LM Studio\mcp_config.json`

### Claude Desktop Configuration

Add this to your Claude Desktop configuration:

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

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Docker-Based Configuration

If you prefer to run the MCP server in Docker:

```json
{
  "mcpServers": {
    "auth-mcp": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--env-file",
        "/Users/xain/Desktop/mcp/.env",
        "auth-mcp-stdio"
      ]
    }
  }
}
```

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
AUTH_API_BASE_URL=https://backstage.orcayo.wattlesol.digital
SWAGGER_URL=https://backstage.orcayo.wattlesol.digital/api-json
```

## 🧪 Testing the Server

### Manual Test

```bash
# Start the server
node auth-mcp

# Send a test request (in another terminal)
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node auth-mcp
```

### Test with MCP Inspector

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Run inspector
mcp-inspector node auth-mcp
```

## 📊 Available Tools

The server dynamically loads tools from your Swagger/OpenAPI specification. Common tools include:

- `authenticate_user` - Sign in with email and password
- `validate_token` - Validate a JWT token
- `register_user` - Register a new user
- `logout_user` - Logout a user
- `check_permission` - Check user permissions
- `get_user_roles` - Get user roles

## 🎯 Features

- ✅ **Low Latency** - Direct stdio communication, no HTTP overhead
- ✅ **Real-time** - Optimized for live AI conversations
- ✅ **Dynamic Tools** - Automatically loads tools from Swagger spec
- ✅ **MCP 2024-11-05** - Latest MCP protocol version
- ✅ **Docker Support** - Easy deployment and isolation
- ✅ **Error Handling** - Robust error handling and logging

## 🔍 Troubleshooting

### Server Not Starting

Check the logs (stderr):
```bash
node auth-mcp 2>&1 | grep "Auth MCP"
```

### Tools Not Loading

Verify your Swagger URL is accessible:
```bash
curl $SWAGGER_URL
```

### Permission Denied

Make sure the launcher is executable:
```bash
chmod +x auth-mcp
```

## 📚 Protocol Details

This server implements the Model Context Protocol (MCP) using stdio transport:

- **Transport**: Standard Input/Output (stdio)
- **Protocol**: JSON-RPC 2.0
- **Version**: MCP 2024-11-05

### Supported Methods

- `initialize` - Initialize the MCP session
- `tools/list` - List available tools
- `tools/call` - Execute a tool

## 🚢 Deployment

### Local Development

```bash
npm install
node auth-mcp
```

### Docker Production

```bash
# Build
docker build -f Dockerfile.mcp -t auth-mcp-stdio .

# Run
docker run --rm -i --env-file .env auth-mcp-stdio
```

### NPM Global Install

```bash
# Link globally
npm link

# Use from anywhere
auth-mcp
```

## 📝 License

ISC

