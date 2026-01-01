#!/usr/bin/env node

/**
 * Auth MCP Server - STDIO Transport
 * Fast, low-latency MCP server for real-time AI conversations
 * Uses standard input/output for communication
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');
const AuthAPIClient = require('./api-client');
const SwaggerToolsAnalyzer = require('./swagger-tools-analyzer');

// Initialize auth API client
const authClient = new AuthAPIClient();

// Token storage file path (use home directory for persistence across calls)
// Using home directory instead of os.tmpdir() for consistency across different temp paths
const TOKEN_FILE = path.join(os.homedir(), '.auth-mcp-token.json');

class StdioMCPServer {
  constructor() {
    this.tools = [];
    this.initialized = false;
    this.accessToken = null; // Store access token for authenticated requests
    this.tokenExpiry = null; // Track token expiration

    // Create readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    // Initialize swagger tools analyzer
    this.swaggerToolsAnalyzer = new SwaggerToolsAnalyzer(
      process.env.SWAGGER_URL || 'https://backstage.orcayo.wattlesol.digital/api-json'
    );

    // Load persisted token from file
    this.loadPersistedToken();

    // Load tools
    this.loadTools();
  }

  async loadTools() {
    try {
      const tools = await this.swaggerToolsAnalyzer.analyzeAndCreateTools();
      this.tools = tools || [];
      this.initialized = true;
      this.logError(`Loaded ${this.tools.length} tools from Swagger spec`);
    } catch (error) {
      this.logError(`Failed to load tools: ${error.message}`);
      this.tools = this.getDefaultTools();
      this.initialized = true;
    }
  }

  // Load persisted token from file
  loadPersistedToken() {
    try {
      this.logError(`[Token] Checking for persisted token at: ${TOKEN_FILE}`);
      if (fs.existsSync(TOKEN_FILE)) {
        this.logError(`[Token] Token file found, loading...`);
        const data = fs.readFileSync(TOKEN_FILE, 'utf8');
        const tokenData = JSON.parse(data);

        // Check if token is expired
        if (tokenData.tokenExpiry && Date.now() >= tokenData.tokenExpiry) {
          this.logError(`[Token] Persisted token expired, clearing`);
          this.clearPersistedToken();
          return;
        }

        this.accessToken = tokenData.accessToken;
        this.tokenExpiry = tokenData.tokenExpiry;

        // Set token in API client
        if (this.accessToken) {
          authClient.setAuthToken(this.accessToken);
          const expiresIn = this.tokenExpiry ? Math.floor((this.tokenExpiry - Date.now()) / 1000) : 'unknown';
          this.logError(`[Token] Loaded persisted token (expires in ${expiresIn}s)`);
        }
      } else {
        this.logError(`[Token] No persisted token file found`);
      }
    } catch (error) {
      this.logError(`[Token] Failed to load persisted token: ${error.message}`);
      this.clearPersistedToken();
    }
  }

  // Save token to file for persistence across calls
  savePersistedToken() {
    try {
      const tokenData = {
        accessToken: this.accessToken,
        tokenExpiry: this.tokenExpiry,
        savedAt: Date.now()
      };
      fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData), 'utf8');
      this.logError(`[Token] Token persisted to disk`);
    } catch (error) {
      this.logError(`[Token] Failed to persist token: ${error.message}`);
    }
  }

  // Clear persisted token file
  clearPersistedToken() {
    try {
      if (fs.existsSync(TOKEN_FILE)) {
        fs.unlinkSync(TOKEN_FILE);
        this.logError(`[Token] Persisted token file deleted`);
      }
    } catch (error) {
      this.logError(`[Token] Failed to delete token file: ${error.message}`);
    }
  }

  // Store access token from authentication response
  storeAccessToken(response) {
    // Log the response structure for debugging
    this.logError(`[Token] Attempting to extract token from response keys: ${Object.keys(response).join(', ')}`);

    // Try to extract token from various possible response formats
    const token = response.accessToken ||
                  response.access_token ||
                  response.token ||
                  response.data?.accessToken ||
                  response.data?.access_token ||
                  response.data?.token ||
                  response.data?.session?.access_token ||
                  response.data?.session?.accessToken;

    if (token) {
      this.accessToken = token;
      this.logError(`[Token] Access token stored successfully (length: ${token.length})`);

      // Set token in API client
      authClient.setAuthToken(token);

      // Extract expiry if available
      const expiresIn = response.expiresIn ||
                        response.expires_in ||
                        response.data?.expiresIn ||
                        response.data?.expires_in ||
                        response.data?.session?.expires_in ||
                        response.data?.session?.expiresIn;
      if (expiresIn) {
        this.tokenExpiry = Date.now() + (expiresIn * 1000);
        this.logError(`[Token] Token will expire in ${expiresIn} seconds`);
      }

      // Persist token to disk for future calls
      this.savePersistedToken();

      return true;
    }

    this.logError(`[Token] Warning: No token found in response. Response structure: ${JSON.stringify(response).substring(0, 200)}`);
    return false;
  }

  // Clear stored access token
  clearAccessToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
    authClient.removeAuthToken();
    this.clearPersistedToken();
    this.logError(`[Token] Access token cleared`);
  }

  // Check if token is expired
  isTokenExpired() {
    if (!this.accessToken) return true;
    if (!this.tokenExpiry) return false; // No expiry info, assume valid
    return Date.now() >= this.tokenExpiry;
  }

  // Get current token status
  getTokenStatus() {
    if (!this.accessToken) {
      return { authenticated: false, message: 'No token stored' };
    }
    if (this.isTokenExpired()) {
      return { authenticated: false, message: 'Token expired' };
    }
    return {
      authenticated: true,
      message: 'Token valid',
      expiresIn: this.tokenExpiry ? Math.floor((this.tokenExpiry - Date.now()) / 1000) : null
    };
  }

  getDefaultTools() {
    return [
      {
        name: 'authenticate_user',
        description: 'Authenticate a user with email and password',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'User email address' },
            password: { type: 'string', description: 'User password' }
          },
          required: ['email', 'password']
        }
      },
      {
        name: 'validate_token',
        description: 'Validate a JWT token',
        inputSchema: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT token to validate' }
          },
          required: ['token']
        }
      }
    ];
  }

  logError(message) {
    // Log to stderr so it doesn't interfere with JSON-RPC communication
    // Only log if DEBUG is enabled
    if (process.env.DEBUG === 'true' || process.env.MCP_DEBUG === 'true') {
      console.error(`[Auth MCP] ${message}`);
    }
  }

  async handleInitialize(request) {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          prompts: {},
          resources: {}
        },
        serverInfo: {
          name: 'auth-mcp',
          version: '1.0.0'
        }
      }
    };
  }

  async handleToolsList(request) {
    // Wait for tools to be loaded
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const toolsList = this.tools.map(tool => {
      if (tool.function) {
        return {
          name: tool.function.name,
          description: tool.function.description,
          inputSchema: tool.function.parameters
        };
      }
      return tool;
    });

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        tools: toolsList
      }
    };
  }

  async handleToolCall(request) {
    const { name, arguments: args } = request.params;

    try {
      // Wait for tools to be loaded
      while (!this.initialized) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Find the tool metadata
      const tool = this.tools.find(t => t.function && t.function.name === name);

      if (!tool || !tool.metadata) {
        throw new Error(`Unknown tool: ${name}`);
      }

      const { path, method } = tool.metadata;

      // Log the request for debugging
      this.logError(`[Request] Tool: ${name}, Method: ${method}, Path: ${path}`);
      if (name.includes('signin')) {
        this.logError(`[Request] Signin attempt with email: ${args.email || 'N/A'}`);
      }

      // Check if this is a signin/authentication endpoint
      const isAuthEndpoint = name.includes('signin') || name.includes('login') || path.includes('/auth/signin');

      // Check if this is a signout endpoint
      const isSignoutEndpoint = name.includes('signout') || name.includes('logout') || path.includes('/auth/signout');

      // Check if this is a public endpoint (doesn't require authentication)
      const isPublicEndpoint = name.includes('health') ||
                               name.includes('signup') ||
                               name.includes('register') ||
                               name.includes('forgot') ||
                               name.includes('otp_send') ||
                               name.includes('otp_verify') ||
                               name.includes('resend_otp') ||
                               path.includes('/health') ||
                               path.includes('/auth/signup') ||
                               path.includes('/auth/forgot') ||
                               path.includes('/auth/otp');

      // For protected endpoints, check if we have a valid token
      if (!isAuthEndpoint && !isSignoutEndpoint && !isPublicEndpoint) {
        const tokenStatus = this.getTokenStatus();
        if (!tokenStatus.authenticated) {
          throw new Error(`Authentication required: ${tokenStatus.message}. Please sign in first using post_api_auth_signin tool.`);
        }
        this.logError(`[Token] Using stored token for ${name} (expires in ${tokenStatus.expiresIn}s)`);
      }

      // Make the API call using the swagger client
      const result = await authClient.makeApiCall(method, path, args);

      // If this was a signin call, store the access token
      if (isAuthEndpoint && result) {
        const tokenStored = this.storeAccessToken(result);
        if (tokenStored) {
          this.logError(`[Auth] Successfully authenticated and stored token`);
        } else {
          this.logError(`[Auth] Warning: Authentication succeeded but no token found in response`);
        }
      }

      // If this was a signout call, clear the token
      if (isSignoutEndpoint) {
        this.clearAccessToken();
        this.logError(`[Auth] Successfully signed out and cleared token`);
      }

      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      };
    } catch (error) {
      // If we get a 401 error, clear the stored token
      if (error.message.includes('401')) {
        this.logError(`[Token] Received 401 error, clearing stored token`);
        this.clearAccessToken();
      }

      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
  }

  async handleRequest(request) {
    try {
      const { method } = request;

      switch (method) {
        case 'initialize':
          return await this.handleInitialize(request);
        
        case 'tools/list':
          return await this.handleToolsList(request);
        
        case 'tools/call':
          return await this.handleToolCall(request);
        
        case 'notifications/initialized':
          // Acknowledge initialization
          return null;
        
        default:
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`
            }
          };
      }
    } catch (error) {
      this.logError(`Error handling request: ${error.message}`);
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: `Internal error: ${error.message}`
        }
      };
    }
  }

  start() {
    this.logError('Auth MCP Server started (stdio mode)');

    this.rl.on('line', async (line) => {
      if (!line.trim()) return;

      try {
        const request = JSON.parse(line);
        const response = await this.handleRequest(request);
        
        if (response) {
          console.log(JSON.stringify(response));
        }
      } catch (error) {
        this.logError(`Error processing line: ${error.message}`);
        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error'
          }
        }));
      }
    });

    process.on('SIGINT', () => process.exit(0));
    process.on('SIGTERM', () => process.exit(0));
  }
}

// Start the server
const server = new StdioMCPServer();
server.start();

