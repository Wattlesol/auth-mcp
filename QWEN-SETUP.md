# Qwen Coding Agent Setup Guide

## ✅ Configuration

The MCP server is configured in `.qwen/settings.json`:

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
  },
  "$version": 2
}
```

## 🔧 Troubleshooting "Disconnected" Error

If you see the server as "Disconnected" in `qwen mcp list`, try these steps:

### 1. Restart Qwen

```bash
# Kill any running Qwen processes
pkill -f qwen

# Restart Qwen
qwen
```

### 2. Test the Server Manually

```bash
# Test if the server starts correctly
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node /Users/xain/Desktop/mcp/auth-mcp
```

You should see a JSON response with no errors.

### 3. Enable Debug Mode

If you need to see what's happening, add `MCP_DEBUG` to the env:

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
        "SWAGGER_URL": "https://backstage.orcayo.wattlesol.digital/api-json",
        "MCP_DEBUG": "true"
      }
    }
  }
}
```

### 4. Check Qwen Logs

```bash
# Check Qwen logs for errors
qwen mcp list --verbose
```

### 5. Verify Dependencies

```bash
cd /Users/xain/Desktop/mcp
npm install
```

## 🎯 Expected Behavior

When working correctly, you should see:

```bash
$ qwen mcp list
Configured MCP servers:

✓ auth-mcp: node /Users/xain/Desktop/mcp/auth-mcp (stdio) - Connected
```

## 🔍 Common Issues

### Issue: "Cannot find module"
**Solution**: Run `npm install` in the project directory

### Issue: "Permission denied"
**Solution**: Make sure auth-mcp is executable:
```bash
chmod +x /Users/xain/Desktop/mcp/auth-mcp
```

### Issue: "Connection timeout"
**Solution**: The Swagger API might be slow. Increase timeout in .env:
```env
AUTH_API_TIMEOUT=10000
```

### Issue: Server shows as disconnected but works in LM Studio
**Solution**: This was fixed by removing stderr logging. Make sure you have the latest version of the server code.

## 📊 Verify It's Working

Once connected, you can test the tools:

```bash
# In Qwen chat
"Can you list the available authentication tools?"

# Or
"Can you authenticate a user with email test@example.com?"
```

## 🆘 Still Having Issues?

1. Check that the server works standalone: `./test-mcp-stdio.sh`
2. Verify the path in `.qwen/settings.json` is correct
3. Make sure Node.js is installed: `node --version`
4. Check that the .env file exists with correct values
5. Try restarting your terminal/shell

## 📝 Notes

- The server is now completely silent unless `MCP_DEBUG=true` is set
- This prevents Qwen from thinking the server failed due to stderr output
- The server loads 18 tools dynamically from your Swagger API
- First connection might take 2-3 seconds while loading the Swagger spec

