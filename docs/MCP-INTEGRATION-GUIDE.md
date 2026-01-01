# MCP Server Integration Guide

This guide explains how to integrate the Auth MCP Server with various AI agents and tools.

## Server Information

- **Base URL**: `http://localhost:3000`
- **MCP Endpoint**: `http://localhost:3000/mcp`
- **Tools List**: `http://localhost:3000/tools`
- **Health Check**: `http://localhost:3000/health`
- **Discovery**: `http://localhost:3000/.well-known/mcp/connection.json`

## Configuration Files

### 1. LM Studio Configuration

**File**: `lm-studio-config.json`

```json
{
  "mcpServers": {
    "auth-mcp": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "auth-mcp-server",
        "node",
        "src/server.js"
      ],
      "env": {
        "PORT": "3000"
      }
    }
  }
}
```

To use with LM Studio:
1. Open LM Studio
2. Go to Settings → MCP Servers
3. Click "Add Server"
4. Import or paste the contents of `lm-studio-config.json`
5. Save and restart LM Studio

### 2. Claude Desktop Configuration

**File**: `claude-desktop-config.json`

```json
{
  "mcpServers": {
    "auth-mcp": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "auth-mcp-server",
        "node",
        "src/server.js"
      ],
      "env": {
        "PORT": "3000",
        "AUTH_API_BASE_URL": "https://backstage.orcayo.wattlesol.digital",
        "SWAGGER_URL": "https://backstage.orcayo.wattlesol.digital/api-json"
      }
    }
  }
}
```

To use with Claude Desktop:
1. Locate your Claude Desktop config file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add the contents from `claude-desktop-config.json` to your config
3. Restart Claude Desktop

### 3. Generic MCP Configuration

**File**: `mcp-config.json` or `mcp-config-simple.json`

This is a standard MCP configuration that works with most MCP-compatible clients.

### 4. HTTP-based Configuration

**File**: `mcp-config-http.json`

For clients that support HTTP transport via curl.

### 5. OpenAI Assistant Configuration

**File**: `openai-assistant-config.json`

For OpenAI Assistants or custom integrations using OpenAI's function calling.

## Making Requests

### Request Format

```json
{
  "function": {
    "name": "function_name",
    "arguments": {
      "param1": "value1",
      "param2": "value2"
    }
  }
}
```

### Response Format

**Success:**
```json
{
  "result": { /* function result */ },
  "success": true
}
```

**Error:**
```json
{
  "error": "error message",
  "success": false
}
```

## Available Functions

The server dynamically loads functions from the Swagger spec. To see all available functions:

```bash
curl http://localhost:3000/tools | jq .
```

### Core Functions

1. **authenticate_user** - Sign in with email and password
2. **validate_token** - Validate a JWT token
3. **register_user** - Register a new user
4. **logout_user** - Logout a user
5. **check_permission** - Check user permissions
6. **get_user_roles** - Get user roles

## Example Usage

### Using cURL

```bash
# Authenticate a user
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "function": {
      "name": "authenticate_user",
      "arguments": {
        "email": "user@example.com",
        "password": "password123"
      }
    }
  }'

# Validate a token
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "function": {
      "name": "validate_token",
      "arguments": {
        "token": "your-jwt-token"
      }
    }
  }'
```

### Using Python

```python
import requests

url = "http://localhost:3000/mcp"
headers = {"Content-Type": "application/json"}

# Authenticate user
payload = {
    "function": {
        "name": "authenticate_user",
        "arguments": {
            "email": "user@example.com",
            "password": "password123"
        }
    }
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

const url = 'http://localhost:3000/mcp';

async function authenticateUser(email, password) {
  try {
    const response = await axios.post(url, {
      function: {
        name: 'authenticate_user',
        arguments: { email, password }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

authenticateUser('user@example.com', 'password123')
  .then(result => console.log(result));
```

## Testing the Server

Run the test script to verify everything is working:

```bash
./test-docker.sh
```

## Troubleshooting

### Server Not Responding

1. Check if the Docker container is running:
   ```bash
   docker-compose ps
   ```

2. Check container logs:
   ```bash
   docker-compose logs auth-mcp
   ```

3. Verify the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

### Connection Refused

Make sure the Docker container is running and port 3000 is not blocked:
```bash
docker-compose up -d
```

### Tools Not Loading

Check the Swagger URL in your `.env` file is accessible:
```bash
curl $SWAGGER_URL
```

## Docker Commands

```bash
# Start the server
docker-compose up -d

# Stop the server
docker-compose down

# View logs
docker-compose logs -f

# Restart the server
docker-compose restart

# Rebuild and start
docker-compose up -d --build
```

## Support

For issues or questions, check the server logs:
```bash
docker-compose logs auth-mcp --tail=100
```

