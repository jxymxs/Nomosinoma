// Simple test script to verify CORS configuration
const fetch = require('node-fetch');

async function testCORS() {
  const testURL = 'https://f68d23c0db40.ngrok-free.app/api/health';
  
  console.log('Testing CORS configuration...');
  console.log('URL:', testURL);
  
  try {
    const response = await fetch(testURL, {
      method: 'GET',
      headers: {
        'Origin': 'https://fanciful-blancmange-063d8c.netlify.app'
      }
    });
    
    console.log('Status:', response.status);
    console.log('CORS Headers:');
    console.log('Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Methods:', response.headers.get('access-control-allow-methods'));
    console.log('Access-Control-Allow-Headers:', response.headers.get('access-control-allow-headers'));
    
    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCORS();
