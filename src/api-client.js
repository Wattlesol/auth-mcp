// api-client.js - Utility for connecting to auth service API
require('dotenv').config();
const axios = require('axios');

class AuthAPIClient {
  constructor() {
    this.baseURL = process.env.AUTH_API_BASE_URL || 'http://localhost:8080';
    this.timeout = parseInt(process.env.AUTH_API_TIMEOUT) || 5000;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Interceptor to add auth token if available
  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove auth token
  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // User authentication
  async authenticate(credentials) {
    try {
      const response = await this.client.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Token validation
  async validateToken(token) {
    try {
      this.setAuthToken(token);
      const response = await this.client.get('/auth/validate');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.removeAuthToken();
    }
  }

  // User registration
  async register(userData) {
    try {
      const response = await this.client.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User logout
  async logout(token) {
    try {
      this.setAuthToken(token);
      const response = await this.client.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.removeAuthToken();
    }
  }

  // Check user permissions
  async checkPermission(token, permission) {
    try {
      this.setAuthToken(token);
      const response = await this.client.get(`/auth/permission/${permission}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.removeAuthToken();
    }
  }

  // Get user roles
  async getUserRoles(token) {
    try {
      this.setAuthToken(token);
      const response = await this.client.get('/auth/roles');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.removeAuthToken();
    }
  }

  // Generic API call method for dynamic tool execution
  async makeApiCall(method, path, params = {}) {
    try {
      // Note: Token is now managed by the MCP server and set via setAuthToken()
      // We don't need to extract it from params anymore since it's already in headers

      let response;
      const httpMethod = method.toLowerCase();

      // Separate path params, query params, and body params
      const { token: _, authorization: __, ...bodyParams } = params;

      // Replace path parameters (e.g., /users/{id} -> /users/123)
      let finalPath = path;
      const pathParamMatches = path.match(/\{([^}]+)\}/g);
      if (pathParamMatches) {
        pathParamMatches.forEach(match => {
          const paramName = match.slice(1, -1); // Remove { }
          if (bodyParams[paramName]) {
            finalPath = finalPath.replace(match, bodyParams[paramName]);
            delete bodyParams[paramName];
          }
        });
      }

      // Make the API call based on HTTP method
      switch (httpMethod) {
        case 'get':
          response = await this.client.get(finalPath, { params: bodyParams });
          break;
        case 'post':
          response = await this.client.post(finalPath, bodyParams);
          break;
        case 'put':
          response = await this.client.put(finalPath, bodyParams);
          break;
        case 'patch':
          response = await this.client.patch(finalPath, bodyParams);
          break;
        case 'delete':
          response = await this.client.delete(finalPath, { data: bodyParams });
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      return new Error(`Network Error: ${error.message}`);
    } else {
      // Something else happened
      return new Error(`Request Error: ${error.message}`);
    }
  }
}

module.exports = AuthAPIClient;