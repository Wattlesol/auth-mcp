# Auth MCP Server - Configuration Guide

## 🎯 Overview

This Auth MCP Server is now a **command-based (stdio) MCP server** optimized for:
- ⚡ **Low latency** - Direct stdio communication
- 🚀 **Real-time** - Perfect for live AI conversations
- 🔌 **Easy integration** - Works with LM Studio, Claude Desktop, and other MCP clients
- 📦 **Flexible deployment** - Run locally or in Docker

## 📋 Configuration Files

### For LM Studio

**File**: `lm-studio-config.json`

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

**Setup Steps:**
1. Open LM Studio
2. Go to **Settings** → **MCP Servers**
3. Click **"Add Server"** or **"Import Configuration"**
4. Paste the configuration above
5. Update the path `/Users/xain/Desktop/mcp/auth-mcp` to match your installation
6. Save and restart LM Studio

### For Claude Desktop

**File**: `claude-desktop-config.json`

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

**Setup Steps:**
1. Locate your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`
2. Open the file in a text editor
3. Add the `auth-mcp` configuration to the `mcpServers` object
4. Update the path to match your installation
5. Save the file
6. Restart Claude Desktop

### For Docker Deployment

**File**: `mcp-config-docker.json`

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

**Setup Steps:**
1. Build the Docker image:
   ```bash
   docker build -f Dockerfile.mcp -t auth-mcp-stdio .
   ```
2. Use the configuration above in your MCP client
3. Make sure the `.env` file path is correct

## 🔧 Environment Variables

Create a `.env` file in your project root:

```env
# Auth API Configuration
AUTH_API_BASE_URL=https://backstage.orcayo.wattlesol.digital
SWAGGER_URL=https://backstage.orcayo.wattlesol.digital/api-json

# Optional: API Timeout (milliseconds)
AUTH_API_TIMEOUT=5000
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/xain/Desktop/mcp
npm install
```

### 2. Test the Server

```bash
# Run the test script
./test-mcp-stdio.sh
```

### 3. Configure Your AI Agent

Choose one of the configuration files above and add it to your AI agent's MCP configuration.

## 📊 Available Tools

The server dynamically loads 18 tools from your Swagger specification:

- `authenticate_user` - Sign in with email and password
- `validate_token` - Validate a JWT token
- `register_user` - Register a new user
- `logout_user` - Logout a user
- `check_permission` - Check user permissions
- `get_user_roles` - Get user roles
- And 12 more tools from your API...

## 🔍 Troubleshooting

### Issue: "Cannot find module 'dotenv'"

**Solution**: Install dependencies
```bash
npm install
```

### Issue: "Permission denied"

**Solution**: Make the launcher executable
```bash
chmod +x auth-mcp
```

### Issue: "Connection closed" or "MCP error -32000"

**Solution**: This usually means the command path is incorrect. Update the path in your configuration to the absolute path of the `auth-mcp` file.

### Issue: Tools not loading

**Solution**: Check if the Swagger URL is accessible
```bash
curl https://backstage.orcayo.wattlesol.digital/api-json
```

## 📝 Example Usage in LM Studio

Once configured, you can use the tools in your conversations:

```
User: Can you authenticate a user with email test@example.com?

AI: I'll use the authenticate_user tool to sign in.
[Calls authenticate_user tool with email and password]

Result: User authenticated successfully with token: eyJhbGc...
```

## 🎯 Performance Tips

1. **Use local installation** for best performance (avoid Docker overhead)
2. **Keep Swagger spec cached** - The server loads it once at startup
3. **Use environment variables** instead of hardcoding values
4. **Monitor stderr** for server logs and errors

## 📚 Additional Resources

- [README-MCP.md](./README-MCP.md) - Detailed MCP server documentation
- [MCP-INTEGRATION-GUIDE.md](./MCP-INTEGRATION-GUIDE.md) - Integration examples
- [test-mcp-stdio.sh](./test-mcp-stdio.sh) - Test script

## 🆘 Support

If you encounter issues:
1. Check the server logs (stderr output)
2. Verify your configuration paths are correct
3. Test the server manually with the test script
4. Check that all dependencies are installed

