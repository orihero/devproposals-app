const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testClerkAuth() {
  try {
    console.log('🧪 Testing Clerk Authentication...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check passed:', health.data.message);
    console.log('Auth provider:', health.data.auth.provider);
    console.log('Available auth endpoints:', health.data.auth.endpoints);
    console.log('');

    console.log('2. Testing authentication endpoints...');
    console.log('ℹ️  Note: These endpoints require a valid Clerk JWT token');
    console.log('   To test with a real token:');
    console.log('   1. Set up Clerk in your frontend');
    console.log('   2. Sign in with Google');
    console.log('   3. Get the JWT token from the browser');
    console.log('   4. Use it in the Authorization header');
    console.log('');

    // Test without token (should fail)
    console.log('3. Testing /api/auth/me without token...');
    try {
      await axios.get(`${BASE_URL}/auth/me`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected request without token');
        console.log('Error:', error.response.data.error.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    console.log('🎉 Clerk authentication tests completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Set up Clerk account at https://clerk.com');
    console.log('2. Get your API keys from the Clerk dashboard');
    console.log('3. Add CLERK_SECRET_KEY to your .env file');
    console.log('4. Test with a real JWT token from your frontend');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('Make sure the server is running on http://localhost:3001');
  }
}

// Run the test
testClerkAuth(); 