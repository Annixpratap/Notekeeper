/**
 * Comprehensive API Verification Test
 * Tests all 11 required endpoints + stretch goals
 * Backend: https://notekeeper-7bn4.onrender.com
 * Frontend: https://notekeeper-1-x6wo.onrender.com
 */

const BASE_URL = 'https://notekeeper-7bn4.onrender.com';

// Test credentials with proper password (8+ characters)
const testUser = {
  email: `testuser${Date.now()}@test.com`,
  password: 'password123',
};

let authToken = null;
let noteId = null;
let sharedWithEmail = null;

const tests = [];

async function test(name, fn) {
  try {
    console.log(`\n📝 Testing: ${name}`);
    await fn();
    tests.push({ name, status: '✅ PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    tests.push({ name, status: `❌ FAIL: ${error.message}` });
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${error.message}`);
  }
}

async function request(method, endpoint, body = null, headers = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  return { status: response.status, data, response };
}

async function runTests() {
  console.log('🚀 Starting API Verification Tests');
  console.log(`Backend URL: ${BASE_URL}`);
  console.log('='.repeat(60));

  // Test 1: Health Check
  await test('GET /health (200)', async () => {
    const { status } = await request('GET', '/health');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
  });

  // Test 2: About Endpoint
  await test('GET /about (200)', async () => {
    const { status } = await request('GET', '/about');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
  });

  // Test 3: OpenAPI Schema
  await test('GET /openapi.json (200)', async () => {
    const { status } = await request('GET', '/openapi.json');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
  });

  // Test 4: Register User
  await test('POST /auth/register (201)', async () => {
    const { status, data } = await request('POST', '/auth/register', {
      email: testUser.email,
      password: testUser.password,
    });
    if (status !== 201) throw new Error(`Expected 201, got ${status}`);
    if (!data.access_token) throw new Error('No access_token in response');
    authToken = data.access_token;
  });

  // Test 5: Login User
  await test('POST /auth/login (200)', async () => {
    const { status, data } = await request('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.access_token) throw new Error('No access_token in response');
    authToken = data.access_token;
  });

  // Test 6: Create Note
  await test('POST /notes (201)', async () => {
    const { status, data } = await request(
      'POST',
      '/notes',
      {
        title: 'Test Note',
        blocks: [
          {
            id: '1',
            type: 'text',
            content: 'This is a test note',
            checked: false,
          },
        ],
      },
      { Authorization: `Bearer ${authToken}` }
    );
    if (status !== 201) throw new Error(`Expected 201, got ${status}`);
    if (!data.data?.id) throw new Error('No note ID in response');
    noteId = data.data.id;
  });

  // Test 7: Get All Notes
  await test('GET /notes (200)', async () => {
    const { status, data } = await request('GET', '/notes', null, {
      Authorization: `Bearer ${authToken}`,
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(data.data)) throw new Error('Response is not an array');
  });

  // Test 8: Get Note by ID
  await test('GET /notes/{id} (200)', async () => {
    const { status, data } = await request('GET', `/notes/${noteId}`, null, {
      Authorization: `Bearer ${authToken}`,
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (data.data?.id !== noteId) throw new Error('Note ID mismatch');
  });

  // Test 9: Update Note
  await test('PUT /notes/{id} (200)', async () => {
    const { status, data } = await request(
      'PUT',
      `/notes/${noteId}`,
      {
        title: 'Updated Test Note',
        blocks: [
          {
            id: '1',
            type: 'text',
            content: 'Updated content',
            checked: false,
          },
        ],
      },
      { Authorization: `Bearer ${authToken}` }
    );
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
  });

  // Test 10: Search Notes
  await test('GET /search (200)', async () => {
    const { status, data } = await request(
      'GET',
      '/search?q=Test',
      null,
      { Authorization: `Bearer ${authToken}` }
    );
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(data.data)) throw new Error('Response is not an array');
  });

  // Test 11: Share Note (requires another user)
  await test('POST /notes/{id}/share (201 or 400)', async () => {
    // First create another user to share with
    const otherUserEmail = `otheruser${Date.now()}@test.com`;
    const registerRes = await request('POST', '/auth/register', {
      email: otherUserEmail,
      password: 'password123',
    });

    if (registerRes.status === 201) {
      const { status } = await request(
        'POST',
        `/notes/${noteId}/share`,
        { share_with_email: otherUserEmail },
        { Authorization: `Bearer ${authToken}` }
      );
      if (status !== 201 && status !== 200)
        throw new Error(`Expected 201 or 200, got ${status}`);
    } else {
      throw new Error('Could not create second user for sharing test');
    }
  });

  // Test 12: Delete Note
  await test('DELETE /notes/{id} (204)', async () => {
    const { status } = await request('DELETE', `/notes/${noteId}`, null, {
      Authorization: `Bearer ${authToken}`,
    });
    if (status !== 204) throw new Error(`Expected 204, got ${status}`);
  });

  // Test 13: Pagination
  await test('GET /notes with pagination (200)', async () => {
    const { status, data } = await request(
      'GET',
      '/notes?page=1&limit=10',
      null,
      { Authorization: `Bearer ${authToken}` }
    );
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.data) throw new Error('No data in response');
  });

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = tests.filter((t) => t.status.includes('PASS')).length;
  const failed = tests.filter((t) => t.status.includes('FAIL')).length;

  tests.forEach((t) => {
    console.log(`${t.status} - ${t.name}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`✅ PASSED: ${passed}/${tests.length}`);
  console.log(`❌ FAILED: ${failed}/${tests.length}`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! All endpoints are working correctly.');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Check errors above.`);
  }
}

runTests().catch(console.error);
