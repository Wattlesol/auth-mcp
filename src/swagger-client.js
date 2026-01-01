// swagger-client.js - Client for interacting with your production swagger API
require('dotenv').config();
const axios = require('axios');

class SwaggerAPIClient {
  constructor(swaggerUrl) {
    this.swaggerUrl = process.env.SWAGGER_URL || swaggerUrl;
    if (!this.swaggerUrl) {
      throw new Error('Swagger URL is required');
    }
    
    // Extract base API URL from swagger URL
    this.baseURL = this.extractBaseURL(this.swaggerUrl);
    this.timeout = 10000; // 10 seconds timeout
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  extractBaseURL(swaggerUrl) {
    // If swagger URL is something like 'https://api.example.com/swagger' or 'https://api.example.com/api-docs'
    // We want to extract the base URL 'https://api.example.com'
    try {
      const url = new URL(swaggerUrl);
      return `${url.protocol}//${url.host}`;
    } catch (error) {
      throw new Error('Invalid swagger URL format');
    }
  }

  // Set authentication token
  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Generic method to call any endpoint in your swagger API
  async callEndpoint(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method: method.toLowerCase(),
        url: endpoint,
        headers: { ...headers },
      };

      if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        config.data = data;
      }

      const response = await this.client(config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Specific methods for auth operations based on common patterns
  async login(credentials) {
    return this.callEndpoint('POST', '/auth/login', credentials);
  }

  async register(userData) {
    return this.callEndpoint('POST', '/auth/register', userData);
  }

  async validateToken(token) {
    this.setAuthToken(token);
    try {
      return await this.callEndpoint('GET', '/auth/validate');
    } finally {
      this.removeAuthToken();
    }
  }

  async logout(token) {
    this.setAuthToken(token);
    try {
      return await this.callEndpoint('POST', '/auth/logout');
    } finally {
      this.removeAuthToken();
    }
  }

  async getRoles(token) {
    this.setAuthToken(token);
    try {
      return await this.callEndpoint('GET', '/auth/roles');
    } finally {
      this.removeAuthToken();
    }
  }

  async checkPermission(token, permission) {
    this.setAuthToken(token);
    try {
      return await this.callEndpoint('GET', `/auth/permission/${permission}`);
    } finally {
      this.removeAuthToken();
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText || `API Error: ${status}`;
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(`Network Error: No response received from API`);
    } else {
      // Something else happened
      throw new Error(`Request Error: ${error.message}`);
    }
  }

  // Method to fetch and analyze the swagger specification
  async getSwaggerSpec() {
    try {
      const response = await axios.get(this.swaggerUrl);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch swagger specification: ${error.message}`);
    }
  }

  // Dynamically create methods based on the swagger spec
  async initializeFromSwagger() {
    const spec = await this.getSwaggerSpec();
    
    // This would parse the swagger spec and dynamically create methods
    // to match the API endpoints defined in your production swagger
    console.log('Swagger spec loaded, paths:', Object.keys(spec.paths || {}));
    
    return spec;
  }
}

module.exports = SwaggerAPIClient;