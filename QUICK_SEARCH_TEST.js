/**
 * Quick Search Test
 */

const BASE_URL = 'https://notekeeper-7bn4.onrender.com';

async function testSearch() {
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

    // Create a note
    const noteRes = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Search Test Note',
        blocks: [
          {
            id: '1',
            type: 'text',
            content: 'This is searchable content',
            checked: false,
          },
        ],
      }),
    });

    const noteData = await noteRes.json();
    console.log('✅ Note created');

    // Test search
    const searchRes = await fetch(`${BASE_URL}/search?q=Search`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`Search response status: ${searchRes.status}`);

    if (searchRes.status === 200) {
      const searchData = await searchRes.json();
      console.log('✅ Search endpoint working!');
      console.log(`Found ${searchData.data.length} results`);
    } else {
      const errorData = await searchRes.json();
      console.log('❌ Search failed');
      console.log('Error:', errorData);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSearch();
