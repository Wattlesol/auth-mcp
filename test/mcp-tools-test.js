// test/mcp-tools-test.js - Test file for MCP server with tools
const axios = require('axios');

// Base URL for the MCP server
const MCP_SERVER_URL = 'http://localhost:3000';

// Test function to send MCP requests using tools format
async function sendMCPRequest(functionName, args = {}) {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/mcp`, {
      function: {
        name: functionName,
        arguments: args
      }
    });
    
    console.log(`MCP Tool Call: ${functionName}`, args);
    console.log('Response:', response.data);
    console.log('---');
    
    return response.data;
  } catch (error) {
    console.error(`MCP Tool Call failed: ${functionName}`, args);
    console.error('Error:', error.response?.data || error.message);
    console.log('---');
  }
}

// Run tests
async function runTests() {
  console.log('Starting MCP Server Tools Tests...\n');
  
  // Test 1: Health check
  console.log('Test 1: Health Check');
  try {
    const healthResponse = await axios.get(`${MCP_SERVER_URL}/health`);
    console.log('Health Check Response:', healthResponse.data);
  } catch (error) {
    console.error('Health Check Failed:', error.message);
  }
  console.log('---\n');
  
  // Test 2: Get available tools
  console.log('Test 2: Get Available Tools');
  try {
    const toolsResponse = await axios.get(`${MCP_SERVER_URL}/tools`);
    console.log('Available Tools:', toolsResponse.data.length);
    toolsResponse.data.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.function.name}: ${tool.function.description}`);
    });
  } catch (error) {
    console.error('Get Tools Failed:', error.message);
  }
  console.log('---\n');
  
  // Test 3: Authenticate user (will fail with mock credentials)
  console.log('Test 3: Authenticate User');
  await sendMCPRequest('authenticate_user', {
    username: 'testuser',
    password: 'testpass'
  });
  
  // Test 4: Register user (will fail with mock data)
  console.log('Test 4: Register User');
  await sendMCPRequest('register_user', {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'newpass'
  });
  
  // Test 5: Validate token (will fail without a valid token)
  console.log('Test 5: Validate Token');
  await sendMCPRequest('validate_token', {
    token: 'valid_token_abc123'  // Using valid token for test
  });
  
  // Test 6: Check permission (will fail without a valid token)
  console.log('Test 6: Check Permission');
  await sendMCPRequest('check_permission', {
    token: 'valid_token_abc123',
    permission: 'read'
  });
  
  // Test 7: Get user roles (will fail without a valid token)
  console.log('Test 7: Get User Roles');
  await sendMCPRequest('get_user_roles', {
    token: 'valid_token_abc123'
  });
  
  // Test 8: Logout (will fail without a valid token)
  console.log('Test 8: Logout');
  await sendMCPRequest('logout_user', {
    token: 'valid_token_abc123'
  });
  
  console.log('\nTests completed!');
}

// Run the tests
runTests().catch(console.error);