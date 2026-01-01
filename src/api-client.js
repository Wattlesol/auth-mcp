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