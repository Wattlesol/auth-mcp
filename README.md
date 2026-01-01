# Auth MCP Server

> **Fast, low-latency MCP server for authentication services**  
> Optimized for real-time AI agent integration with LM Studio, Claude Desktop, and more.

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/wattlesol/auth-mcp.git
cd auth-mcp

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API URLs

# 4. Test the server
./test-mcp-stdio.sh

# 5. Configure your AI agent (see Configuration section below)
```

## ✨ Features

- ⚡ **Low Latency** - Direct stdio communication (< 10ms)
- 🔧 **18 Dynamic Tools** - Auto-loaded from Swagger/OpenAPI spec
- 🤖 **AI Agent Ready** - Works with LM Studio, Claude Desktop, etc.
- 🐳 **Docker Support** - Optional containerized deployment
- 📚 **Complete Docs** - Comprehensive guides and examples

## 📋 Configuration

### For LM Studio

```json
{
  "mcpServers": {
    "auth-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/auth-mcp/auth-mcp"],
      "env": {
        "AUTH_API_BASE_URL": "https://your-auth-api.example.com",
        "SWAGGER_URL": "https://your-auth-api.example.com/api-json"
      }
    }
  }
}
```

### For Claude Desktop

Same configuration as above. Add to:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### For Qwen Coding Agent

Configuration is in `.qwen/settings.json` (see [QWEN-SETUP.md](./QWEN-SETUP.md) for details)

## 🎯 Available Tools (18 Total)

The server dynamically loads tools from your Swagger/OpenAPI specification. Example tools:

**Authentication & Sign In:**
- `post_api_auth_signin` - Sign in with email/password
- `post_api_auth_staff_signin` - Staff sign in (branch-aware)
- `post_api_auth_signup` - Create new user account
- `post_api_auth_signout` - Sign out current user

**User Info & Profile:**
- `get_api_auth_me` - Get current user information
- `put_api_auth_profile` - Update user profile

**OTP & Verification:**
- `post_api_auth_otp_send` - Send OTP to email
- `post_api_auth_otp_verify` - Verify OTP code
- `post_api_auth_verify_email` - Verify email with OTP
- `post_api_auth_verify_phone` - Verify phone with OTP

**Password Management:**
- `post_api_auth_forgot_request` - Request password reset
- `post_api_auth_change_password` - Change password

**Token & Health:**
- `post_api_auth_refresh_token` - Refresh JWT token
- `get_api_health` - Health check endpoint

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[docs/COPY-PASTE-CONFIG.txt](./docs/COPY-PASTE-CONFIG.txt)** | 📋 Ready-to-use configurations |
| **[docs/QUICK-SETUP.md](./docs/QUICK-SETUP.md)** | 🚀 Get started in 3 steps |
| **[docs/CONFIGURATION-GUIDE.md](./docs/CONFIGURATION-GUIDE.md)** | 🔧 Detailed setup guide |
| **[docs/SUMMARY.md](./docs/SUMMARY.md)** | 📖 Complete project overview |
| **[docs/README-MCP.md](./docs/README-MCP.md)** | 📘 MCP protocol details |

## 🧪 Testing

```bash
# Run automated tests
./test-mcp-stdio.sh

# Manual test
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node auth-mcp
```

## 🏗️ Architecture

```
AI Agent (LM Studio/Claude)
         ↓ stdio (JSON-RPC)
Auth MCP Server (Node.js)
         ↓ HTTPS
Backend Auth API (Swagger)
```

## 📊 Performance

- **Latency**: < 10ms (stdio communication)
- **Startup**: ~2 seconds (loads Swagger spec)
- **Memory**: ~50MB (Node.js + dependencies)
- **Protocol**: MCP 2024-11-05

## 🐳 Docker Deployment

```bash
# Build
docker build -f Dockerfile.mcp -t auth-mcp-stdio .

# Run
docker run --rm -i --env-file .env auth-mcp-stdio
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
AUTH_API_BASE_URL=https://your-auth-api.example.com
SWAGGER_URL=https://your-auth-api.example.com/api-json
AUTH_API_TIMEOUT=5000
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run HTTP server (legacy)
npm start

# Run MCP server (stdio)
npm run mcp

# Run tests
npm test
```

## 📦 Project Structure

```
├── auth-mcp                      # Main launcher script
├── src/
│   ├── mcp-stdio-server.js       # MCP server (stdio)
│   ├── api-client.js             # Auth API client
│   ├── swagger-client.js         # Swagger API client
│   └── swagger-tools-analyzer.js # Tool generator
├── config/
│   ├── lm-studio-config.json     # LM Studio config
│   ├── claude-desktop-config.json # Claude Desktop config
│   └── mcp-config-docker.json    # Docker config
├── docs/                         # Documentation
├── test/                         # Test files
├── .env.example                  # Example environment variables
└── package.json                  # Dependencies
```

## 🤝 Contributing

This is a production-ready MCP server. Feel free to:
- Add more tools
- Improve error handling
- Add monitoring/metrics
- Extend documentation

## 📄 License

ISC

## 🆘 Support & Troubleshooting

**Issues?** Check these guides:
1. [QWEN-SETUP.md](./QWEN-SETUP.md) - Qwen Coding Agent setup & troubleshooting
2. [QWEN-TOOLS-FIX.md](./QWEN-TOOLS-FIX.md) - Tools not showing? Read this
3. [docs/QUICK-SETUP.md](./docs/QUICK-SETUP.md) - Quick troubleshooting
4. [docs/CONFIGURATION-GUIDE.md](./docs/CONFIGURATION-GUIDE.md) - Detailed help

**Enable Debug Mode:**
```bash
MCP_DEBUG=true node auth-mcp
```

## 🎉 Success!

You now have a production-ready MCP server for AI agents!

**Next Steps:**
1. Configure your AI agent with the settings above
2. Test with: "Can you list the available authentication tools?"
3. Start using the tools in your AI conversations!

