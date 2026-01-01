# 🔐 Token Management Guide

## Overview

The Auth MCP Server now includes **automatic token management** that:
- ✅ Stores access tokens after successful authentication
- ✅ Automatically includes tokens in subsequent API calls
- ✅ Tracks token expiration
- ✅ Clears tokens on signout or 401 errors
- ✅ Provides clear error messages when authentication is required

---

## How It Works

### 1. **Authentication Flow**

```
User → Sign In → Server stores token → Subsequent calls use token automatically
```

**Step 1: Sign In**
```json
{
  "name": "post_api_auth_signin",
  "arguments": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

**What happens:**
- Server makes API call to `/api/auth/signin`
- If successful, extracts `accessToken` from response
- Stores token in memory
- Sets token in API client headers
- All future requests automatically include this token

**Step 2: Use Protected Endpoints**
```json
{
  "name": "get_api_auth_me",
  "arguments": {}
}
```

**What happens:**
- Server checks if token is stored
- If yes, includes token in Authorization header
- If no, returns error: "Authentication required: No token stored"

### 2. **Token Storage**

The server stores:
- `accessToken`: The JWT or bearer token
- `tokenExpiry`: Calculated from `expiresIn` field (if provided)

**Supported response formats:**
```json
// Format 1: Direct token
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 3600
}

// Format 2: Nested in data
{
  "data": {
    "access_token": "eyJhbGc...",
    "expires_in": 3600
  }
}

// Format 3: Simple token
{
  "token": "eyJhbGc..."
}
```

### 3. **Token Expiration**

- Server tracks token expiration time
- Before each API call, checks if token is expired
- If expired, returns error: "Authentication required: Token expired"
- User must sign in again to get a new token

### 4. **Token Clearing**

Token is automatically cleared when:
- ✅ User calls signout endpoint
- ✅ Server receives 401 Unauthorized error
- ✅ Token expires

---

## Usage Examples

### Example 1: Complete Authentication Flow

```javascript
// 1. Sign in
await toolCall("post_api_auth_signin", {
  email: "irfan@mailinator.com",
  password: "Muh@mm@d9091"
});
// ✅ Token stored automatically

// 2. Get user profile (token included automatically)
await toolCall("get_api_auth_me", {});
// ✅ Returns user profile

// 3. Update profile (token included automatically)
await toolCall("put_api_auth_profile", {
  firstName: "Irfan",
  lastName: "Khan"
});
// ✅ Profile updated

// 4. Sign out
await toolCall("post_api_auth_signout", {});
// ✅ Token cleared automatically
```

### Example 2: Error Handling

```javascript
// Try to access protected endpoint without signing in
await toolCall("get_api_auth_me", {});
// ❌ Error: "Authentication required: No token stored. Please sign in first using post_api_auth_signin tool."

// Sign in with invalid credentials
await toolCall("post_api_auth_signin", {
  email: "wrong@example.com",
  password: "wrongpass"
});
// ❌ Error: "API Error: 401 - Invalid email or password"
// ✅ Token cleared automatically
```

---

## Qwen Prompt Examples

### Prompt 1: Sign In and Get Profile
```
Please sign me in with email irfan@mailinator.com and password Muh@mm@d9091, 
then show me my user profile information.
```

### Prompt 2: Complete User Journey
```
I need you to:
1. Sign in with email: irfan@mailinator.com, password: Muh@mm@d9091
2. Get my current profile information
3. Update my profile with firstName: "Irfan" and lastName: "Khan"
4. Show me the updated profile
5. Sign me out

Please use the auth-mcp tools and show me the response from each step.
```

### Prompt 3: Password Change
```
Sign me in with irfan@mailinator.com / Muh@mm@d9091, then change my password 
to NewPassword123! using the change password tool.
```

---

## Technical Implementation

### Server-Side Token Management

**File: `src/mcp-stdio-server.js`**

```javascript
class StdioMCPServer {
  constructor() {
    this.accessToken = null;      // Stored token
    this.tokenExpiry = null;       // Expiration timestamp
  }

  storeAccessToken(response) {
    // Extract token from various response formats
    const token = response.accessToken || response.access_token || response.token;
    if (token) {
      this.accessToken = token;
      authClient.setAuthToken(token);  // Set in API client
    }
  }

  clearAccessToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
    authClient.removeAuthToken();
  }

  isTokenExpired() {
    if (!this.accessToken) return true;
    if (!this.tokenExpiry) return false;
    return Date.now() >= this.tokenExpiry;
  }
}
```

---

## Debugging

Enable debug mode to see token management logs:

```bash
MCP_DEBUG=true node auth-mcp
```

**Debug output:**
```
[Token] Access token stored successfully
[Token] Token will expire in 3600 seconds
[Token] Using stored token for get_api_auth_me (expires in 3540s)
[Auth] Successfully authenticated and stored token
[Auth] Successfully signed out and cleared token
[Token] Received 401 error, clearing stored token
```

---

## Security Notes

- ✅ Tokens are stored in memory only (not persisted to disk)
- ✅ Tokens are cleared on signout
- ✅ Tokens are cleared on 401 errors
- ✅ Each MCP server instance has its own token storage
- ⚠️ Tokens are not encrypted in memory (standard practice for in-memory tokens)

---

## Troubleshooting

### Issue: "Authentication required: No token stored"
**Solution**: Sign in first using `post_api_auth_signin` tool

### Issue: "Authentication required: Token expired"
**Solution**: Sign in again to get a new token

### Issue: "API Error: 401 - Invalid email or password"
**Solution**: Check credentials are correct

### Issue: Token not being stored after signin
**Solution**: Check API response format includes `accessToken`, `access_token`, or `token` field

---

**Status**: ✅ Token management fully implemented and ready for testing!

