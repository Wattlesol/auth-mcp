# 🎯 Qwen Test Prompts for Auth MCP Server

## ✅ What's New

The Auth MCP Server now includes **automatic token management**! This means:
- Sign in once, and the server remembers your token
- All subsequent API calls automatically include your authentication
- No need to manually pass tokens between requests
- Clear error messages if you're not authenticated

---

## 🚀 Test Prompt 1: Basic Authentication Flow

Copy and paste this into Qwen:

```
Please help me test the authentication system. Use the auth-mcp tools to:

1. Sign in with these credentials:
   - Email: irfan@mailinator.com
   - Password: Muh@mm@d9091

2. After signing in, get my user profile using the get_api_auth_me tool

3. Show me both responses in a clear format

The server should automatically store the authentication token after step 1 
and use it for step 2 without me having to provide it again.
```

---

## 🚀 Test Prompt 2: Complete User Journey

```
I want to test the complete authentication flow. Please:

1. Sign me in with email: irfan@mailinator.com and password: Muh@mm@d9091

2. Get my current user profile

3. Update my profile with:
   - firstName: "Irfan"
   - lastName: "Khan"
   - phone: "+1234567890"

4. Get my profile again to confirm the changes

5. Sign me out

Use the auth-mcp tools and show me the response from each step. 
The authentication token should be automatically managed by the server.
```

---

## 🚀 Test Prompt 3: Error Handling Test

```
Let's test the authentication error handling:

1. First, try to get my user profile WITHOUT signing in 
   (this should fail with a clear error message)

2. Then sign in with: irfan@mailinator.com / Muh@mm@d9091

3. Now try to get my profile again (this should work)

Show me what happens at each step.
```

---

## 🚀 Test Prompt 4: Password Change

```
Please help me change my password:

1. Sign in with:
   - Email: irfan@mailinator.com
   - Current Password: Muh@mm@d9091

2. Change my password to: NewSecurePass123!

3. Sign out

4. Try to sign in again with the NEW password to verify it worked

Use the auth-mcp tools and show me the results.
```

---

## 🚀 Test Prompt 5: OTP Verification Flow

```
Test the OTP (One-Time Password) verification:

1. Send an OTP to email: irfan@mailinator.com

2. Wait for me to provide the OTP code

3. Verify the OTP code I provide

4. Show me the verification result

Use the post_api_auth_otp_send and post_api_auth_otp_verify tools.
```

---

## 🚀 Test Prompt 6: Forgot Password Flow

```
Test the password reset flow:

1. Request a password reset for: irfan@mailinator.com

2. Wait for me to provide the OTP code

3. Verify the OTP

4. Reset the password to: ResetPassword123!

Use the forgot password tools and guide me through each step.
```

---

## 📊 Expected Behavior

### ✅ Successful Sign In
You should see:
- A response with user data
- Possibly an `accessToken` or `token` field
- Server logs (if debug mode): `[Token] Access token stored successfully`

### ✅ Subsequent API Calls
- Should work automatically without providing credentials again
- Server logs: `[Token] Using stored token for <tool_name>`

### ❌ Calling Protected Endpoint Without Auth
You should see:
```
Error: Authentication required: No token stored. 
Please sign in first using post_api_auth_signin tool.
```

### ❌ Invalid Credentials
You should see:
```
Error: API Error: 401 - Invalid email or password
```

---

## 🐛 Debugging

If something doesn't work, you can ask Qwen:

```
Can you check the auth-mcp server logs? 
Enable debug mode and show me what's happening with the token management.
```

---

## 📝 Notes

1. **Token Persistence**: Tokens are stored in memory for the duration of the conversation
2. **Token Expiration**: If a token expires, you'll get a clear error message
3. **Multiple Sign-ins**: Signing in again will replace the old token with a new one
4. **Sign Out**: Clears the stored token, requiring you to sign in again

---

## 🎯 Recommended First Test

Start with **Test Prompt 1** (Basic Authentication Flow) to verify everything is working correctly.

If that works, try **Test Prompt 3** (Error Handling Test) to see how the server handles authentication errors.

---

**Ready to test!** 🚀 Copy any of the prompts above and paste them into Qwen Coding Agent.

