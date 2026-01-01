// test/mcp-test.js - Test file for MCP server
const axios = require('axios');

// Base URL for the MCP server
const MCP_SERVER_URL = 'http://localhost:3000';

// Test function to send MCP requests
async function sendMCPRequest(method, params = {}) {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/mcp`, {
      method,
      params
    });
    
    console.log(`MCP Request: ${method}`, params);
    console.log('Response:', response.data);
    console.log('---');
    
    return response.data;
  } catch (error) {
    console.error(`MCP Request failed: ${method}`, params);
    console.error('Error:', error.response?.data || error.message);
    console.log('---');
  }
}

// Run tests
async function runTests() {
  console.log('Starting MCP Server Tests...\n');
  
  // Test 1: Health check
  console.log('Test 1: Health Check');
  try {
    const healthResponse = await axios.get(`${MCP_SERVER_URL}/health`);
    console.log('Health Check Response:', healthResponse.data);
  } catch (error) {
    console.error('Health Check Failed:', error.message);
  }
  console.log('---\n');
  
  // Test 2: Authenticate user (will fail with mock credentials)
  console.log('Test 2: Authenticate User');
  await sendMCPRequest('authenticate', {
    username: 'testuser',
    password: 'testpass'
  });
  
  // Test 3: Register user (will fail with mock data)
  console.log('Test 3: Register User');
  await sendMCPRequest('register', {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'newpass'
  });
  
  // Test 4: Validate token (will fail without a valid token)
  console.log('Test 4: Validate Token');
  await sendMCPRequest('validate-token', {
    token: 'mock-token'
  });
  
  // Test 5: Check permission (will fail without a valid token)
  console.log('Test 5: Check Permission');
  await sendMCPRequest('check-permission', {
    token: 'mock-token',
    permission: 'read'
  });
  
  // Test 6: Get user roles (will fail without a valid token)
  console.log('Test 6: Get User Roles');
  await sendMCPRequest('get-user-roles', {
    token: 'mock-token'
  });
  
  // Test 7: Logout (will fail without a valid token)
  console.log('Test 7: Logout');
  await sendMCPRequest('logout', {
    token: 'mock-token'
  });
  
  console.log('\nTests completed!');
}

// Run the tests
runTests().catch(console.error);