# 🔧 Fixed: Qwen Not Showing Tools

## 🐛 The Problem

Qwen showed the server as "Ready" but no tools were visible:
```
🟢 auth-mcp - Ready
```

When running `/tools`, only Qwen's built-in tools were shown, not the 18 MCP tools.

## 🔍 Root Cause

The `pathToFunctionName()` function was generating **duplicate tool names**. All auth-related POST endpoints were being named `authenticate_user`, which violated the MCP requirement that all tool names must be unique.

Example of the problem:
- `/api/auth/signin` → `authenticate_user`
- `/api/auth/signup` → `authenticate_user`
- `/api/auth/signout` → `authenticate_user`
- `/api/auth/otp/send` → `authenticate_user`
- etc.

Qwen couldn't display tools with duplicate names.

## ✅ The Fix

Changed the naming strategy to use `method_path` format, ensuring unique names:

**Before:**
```javascript
if (cleanPath.includes('auth') || cleanPath.includes('login')) {
  switch (method.toLowerCase()) {
    case 'post': return 'authenticate_user';  // ❌ Same name for all!
    case 'delete': return 'logout_user';
    default: return cleanPath.replace(/auth_?/, '') || cleanPath;
  }
}
```

**After:**
```javascript
pathToFunctionName(path, method) {
  const cleanPath = path.replace(/^\//, '').replace(/[{}]/g, '').replace(/\//g, '_');
  const functionName = `${method.toLowerCase()}_${cleanPath}`;
  return functionName;  // ✅ Unique name for each endpoint!
}
```

## 📋 Tool Names Now

All 18 tools now have unique, descriptive names:

1. `post_api_auth_signin` - Sign in with email and password
2. `post_api_auth_staff_signin` - Staff sign in (branch-aware)
3. `post_api_auth_staff_select_branch` - Complete staff login after choosing a branch
4. `post_api_auth_signup` - Create a new user account
5. `post_api_auth_signout` - Sign out the current user
6. `get_api_auth_me` - Get current user information
7. `post_api_auth_otp_send` - Send OTP to email address
8. `post_api_auth_otp_verify` - Verify OTP code
9. `post_api_auth_resend_otp` - Resend OTP to email address
10. `post_api_auth_forgot_request` - Request password reset
11. `post_api_auth_forgot_verify_otp` - Verify password reset OTP
12. `post_api_auth_forgot_reset` - Reset password with new password
13. `post_api_auth_change_password` - Change password for logged-in user
14. `put_api_auth_profile` - Update user profile
15. `post_api_auth_verify_email` - Verify email address with OTP
16. `post_api_auth_verify_phone` - Verify phone number with OTP
17. `post_api_auth_refresh_token` - Refresh JWT token
18. `get_api_health` - Health check endpoint

## 🎯 Next Steps

1. **Restart Qwen:**
   ```bash
   pkill -f qwen
   qwen
   ```

2. **Check tools are loaded:**
   ```
   /mcp desc
   ```
   
   You should now see all 18 tools listed!

3. **Test a tool:**
   ```
   Can you use the post_api_auth_signin tool to sign in with email test@example.com?
   ```

## 🧪 Verify It's Working

Run this test to see all unique tool names:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | node /Users/xain/Desktop/mcp/auth-mcp 2>/dev/null | jq '.result.tools[].name'
```

Expected output:
```
"post_api_auth_signin"
"post_api_auth_staff_signin"
"post_api_auth_staff_select_branch"
...
```

## 📊 Summary

- ✅ Fixed duplicate tool names
- ✅ All 18 tools now have unique identifiers
- ✅ Tool names follow consistent `method_path` pattern
- ✅ Qwen should now display all tools correctly

---

**Status**: ✅ Fixed - Restart Qwen to see the tools!

