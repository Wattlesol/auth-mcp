#!/usr/bin/env node

/**
 * Auth MCP Server - STDIO Transport
 * Fast, low-latency MCP server for real-time AI conversations
 * Uses standard input/output for communication
 */

const readline = require('readline');
const AuthAPIClient = require('./api-client');
const SwaggerToolsAnalyzer = require('./swagger-tools-analyzer');

// Initialize auth API client
const authClient = new AuthAPIClient();

class StdioMCPServer {
  constructor() {
    this.tools = [];
    this.initialized = false;
    
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

      // Make the API call using the swagger client
      const result = await authClient.makeApiCall(method, path, args);

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

