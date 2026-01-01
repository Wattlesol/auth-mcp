# Auth MCP Server - Qwen Usage Guide

## Important: Restart Qwen MCP Connection

**Before testing, you MUST restart Qwen's MCP connection to load the latest tools!**

In Qwen, disconnect and reconnect the MCP server, or restart Qwen entirely.

## Available Tools

### Authentication Tools

#### 1. Sign In (Regular User)
**Tool Name**: `post_api_auth_signin`

**Parameters**:
```json
{
  "email": "sxain123@gmail.com",
  "password": "Muh@mm@d9091"
}
```

**Example Call**:
```
Use the post_api_auth_signin tool with email "sxain123@gmail.com" and password "Muh@mm@d9091"
```

#### 2. Get User Profile
**Tool Name**: `get_api_auth_me`

**Parameters**: None (uses stored token)

**Example Call**:
```
Use the get_api_auth_me tool to get my profile
```

#### 3. Sign Out
**Tool Name**: `post_api_auth_signout`

**Parameters**: None

#### 4. Sign Up (Create Account)
**Tool Name**: `post_api_auth_signup`

**Parameters**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Other Available Tools

- `post_api_auth_staff_signin` - Staff sign in
- `post_api_auth_staff_select_branch` - Select branch after staff signin
- `post_api_auth_otp_send` - Send OTP
- `post_api_auth_otp_verify` - Verify OTP
- `post_api_auth_resend_otp` - Resend OTP
- `post_api_auth_forgot_request` - Request password reset
- `post_api_auth_forgot_verify_otp` - Verify password reset OTP
- `post_api_auth_forgot_reset` - Reset password
- `post_api_auth_change_password` - Change password
- `put_api_auth_profile` - Update profile
- `post_api_auth_verify_email` - Verify email
- `post_api_auth_verify_phone` - Verify phone
- `post_api_auth_refresh_token` - Refresh token
- `get_api_health` - Health check

## Test Sequence for Qwen

### Step 1: Sign In
```
Please use the post_api_auth_signin tool to sign me in with:
- email: sxain123@gmail.com
- password: Muh@mm@d9091
```

### Step 2: Get Profile (uses persisted token)
```
Now use the get_api_auth_me tool to get my user profile
```

## Token Persistence

The server automatically:
1. Saves the token to `~/.auth-mcp-token.json` after signin
2. Loads the token from file on each new request
3. Uses the token for all authenticated endpoints
4. Clears the token on signout or 401 errors

## Troubleshooting

### Error: "Unknown tool: authenticate_user"
- **Cause**: Qwen is using an old/cached tool list
- **Solution**: Restart Qwen's MCP connection or restart Qwen

### Error: "Authentication required: No token stored"
- **Cause**: No signin has been performed yet, or token expired
- **Solution**: Call `post_api_auth_signin` first

### Error: "API Error: 401 - Invalid email or password"
- **Cause**: Wrong credentials
- **Solution**: Verify email and password are correct

## MCP Server Configuration

Location: `.qwen/settings.json`

```json
{
  "mcpServers": {
    "auth-mcp": {
      "command": "node",
      "args": ["/Users/xain/Desktop/mcp/auth-mcp"],
      "env": {
        "AUTH_API_BASE_URL": "https://backstage.orcayo.wattlesol.digital",
        "SWAGGER_URL": "https://backstage.orcayo.wattlesol.digital/api-json"
      }
    }
  }
}
```

## Debug Mode

To see detailed logs, set `MCP_DEBUG=true`:

```bash
MCP_DEBUG=true node auth-mcp
```

This will show:
- Token loading/saving operations
- Request details
- Response structures
- Error details

