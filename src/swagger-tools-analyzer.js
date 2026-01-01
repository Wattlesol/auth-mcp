// swagger-tools-analyzer.js - Analyze swagger and create tools
require('dotenv').config();
const axios = require('axios');

class SwaggerToolsAnalyzer {
  constructor(swaggerUrl) {
    this.swaggerUrl = process.env.SWAGGER_URL || swaggerUrl;
  }

  async analyzeAndCreateTools() {
    if (!this.swaggerUrl) {
      if (process.env.DEBUG === 'true' || process.env.MCP_DEBUG === 'true') {
        console.error('No SWAGGER_URL provided, using default tools');
      }
      return this.getDefaultTools();
    }

    try {
      // Fetch swagger specification
      const response = await axios.get(this.swaggerUrl);
      const swaggerSpec = response.data;

      if (process.env.DEBUG === 'true' || process.env.MCP_DEBUG === 'true') {
        console.error(`Analyzing swagger spec from: ${this.swaggerUrl}`);
      }

      // Extract paths and create tools based on them
      const tools = this.extractToolsFromSwagger(swaggerSpec);

      if (process.env.DEBUG === 'true' || process.env.MCP_DEBUG === 'true') {
        console.error(`Generated ${tools.length} tools from swagger spec`);
      }
      return tools;
    } catch (error) {
      if (process.env.DEBUG === 'true' || process.env.MCP_DEBUG === 'true') {
        console.error('Failed to fetch or parse swagger spec:', error.message);
        console.error('Using default authentication tools instead');
      }
      return this.getDefaultTools();
    }
  }

  extractToolsFromSwagger(swaggerSpec) {
    const tools = [];
    const paths = swaggerSpec.paths || {};

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
          const tool = this.createToolFromOperation(path, method, operation, swaggerSpec.components);
          if (tool) {
            tools.push(tool);
          }
        }
      }
    }

    return tools;
  }

  createToolFromOperation(path, method, operation, components = {}) {
    // Create function name from path and method
    let functionName = this.pathToFunctionName(path, method);

    // Clean up the function name to be a valid JavaScript identifier
    functionName = functionName.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');

    // Get parameters schema from operation
    const parametersSchema = this.extractParametersSchema(operation, components);

    return {
      type: "function",
      function: {
        name: functionName,
        description: operation.summary || operation.description || `Call ${method.toUpperCase()} on ${path}`,
        parameters: parametersSchema
      },
      // Store metadata for API calls
      metadata: {
        path: path,
        method: method.toUpperCase(),
        operationId: operation.operationId
      }
    };
  }

  pathToFunctionName(path, method) {
    // Convert path like /auth/login to function name like post_auth_login
    const cleanPath = path.replace(/^\//, '').replace(/[{}]/g, '').replace(/\//g, '_');

    // Create unique function name using method + path
    // This ensures each endpoint has a unique tool name
    const functionName = `${method.toLowerCase()}_${cleanPath}`;

    return functionName;
  }

  extractParametersSchema(operation, components = {}) {
    const schema = {
      type: "object",
      properties: {},
      required: []
    };

    // Process path and query parameters
    if (operation.parameters && Array.isArray(operation.parameters)) {
      for (const param of operation.parameters) {
        if (param.in === 'path' || param.in === 'query') {
          schema.properties[param.name] = {
            type: param.schema?.type || 'string',
            description: param.description || param.name
          };
          
          if (param.required) {
            schema.required.push(param.name);
          }
        }
      }
    }

    // Process request body parameters
    if (operation.requestBody) {
      const content = operation.requestBody.content;
      if (content && content['application/json']) {
        const bodySchema = content['application/json'].schema;
        
        if (bodySchema.$ref) {
          // Handle references to components
          const refName = bodySchema.$ref.split('/').pop();
          if (components.schemas && components.schemas[refName]) {
            const resolvedSchema = components.schemas[refName];
            Object.assign(schema.properties, resolvedSchema.properties || {});
            if (resolvedSchema.required) {
              schema.required = [...new Set([...schema.required, ...resolvedSchema.required])];
            }
          }
        } else {
          Object.assign(schema.properties, bodySchema.properties || {});
          if (bodySchema.required) {
            schema.required = [...new Set([...schema.required, ...bodySchema.required])];
          }
        }
      }
    }

    return schema;
  }

  getDefaultTools() {
    // Return the default authentication tools if swagger analysis fails
    return [
      {
        type: "function",
        function: {
          name: "authenticate_user",
          description: "Authenticate a user with username and password",
          parameters: {
            type: "object",
            properties: {
              username: { type: "string", description: "The user's username" },
              password: { type: "string", description: "The user's password" }
            },
            required: ["username", "password"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "validate_token",
          description: "Validate an authentication token",
          parameters: {
            type: "object",
            properties: {
              token: { type: "string", description: "The authentication token to validate" }
            },
            required: ["token"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "register_user",
          description: "Register a new user",
          parameters: {
            type: "object",
            properties: {
              username: { type: "string", description: "The user's desired username" },
              email: { type: "string", description: "The user's email address" },
              password: { type: "string", description: "The user's password" }
            },
            required: ["username", "email", "password"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "logout_user",
          description: "Logout a user with their token",
          parameters: {
            type: "object",
            properties: {
              token: { type: "string", description: "The user's authentication token" }
            },
            required: ["token"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "check_permission",
          description: "Check if a user has a specific permission",
          parameters: {
            type: "object",
            properties: {
              token: { type: "string", description: "The user's authentication token" },
              permission: { type: "string", description: "The permission to check" }
            },
            required: ["token", "permission"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_user_roles",
          description: "Get the roles of a user",
          parameters: {
            type: "object",
            properties: {
              token: { type: "string", description: "The user's authentication token" }
            },
            required: ["token"]
          }
        }
      }
    ];
  }
}

module.exports = SwaggerToolsAnalyzer;