/**
 * Debug Search Endpoint
 */

const BASE_URL = 'https://notekeeper-7bn4.onrender.com';

async function debugSearch() {
  try {
    // Register user
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@test.com`,
        password: 'password123',
      }),
    });

    const registerData = await registerRes.json();
    const token = registerData.access_token;

    if (!token) {
      console.log('❌ Failed to get token');
      return;
    }

    console.log('✅ Token obtained');

    // Test search with empty query
    const searchRes = await fetch(`${BASE_URL}/search?q=`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`Search response status: ${searchRes.status}`);
    console.log(`Content-Type: ${searchRes.headers.get('content-type')}`);

    const text = await searchRes.text();
    console.log('Response body:', text.substring(0, 500));

    if (searchRes.status === 200) {
      try {
        const searchData = JSON.parse(text);
        console.log('✅ Search endpoint working!');
        console.log(`Found ${searchData.data.length} results`);
      } catch (e) {
        console.log('❌ Response is not valid JSON');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugSearch();
