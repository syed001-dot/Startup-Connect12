// Simple script to test the admin API directly
const fetch = require('node-fetch');

// Replace with your actual token
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOIl0sInN1YiI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ1NjgzODAwLCJleHAiOjE3NDU3NzAyMDB9.qC3dOCk8_5X54aCOKfDJxleswzdTq_nyYgGoyB5tvEQ';

async function testAdminAPI() {
  try {
    // Test GET users endpoint
    console.log('Testing GET /api/admin/users');
    const usersResponse = await fetch('http://localhost:8080/api/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', usersResponse.status);
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('Users:', users.length);
    } else {
      console.log('Error response:', await usersResponse.text());
    }
    
    // Test DELETE user endpoint
    console.log('\nTesting DELETE /api/admin/users/1');
    const deleteResponse = await fetch('http://localhost:8080/api/admin/users/1', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', deleteResponse.status);
    if (deleteResponse.ok) {
      console.log('Delete successful');
    } else {
      console.log('Error response:', await deleteResponse.text());
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAdminAPI();
