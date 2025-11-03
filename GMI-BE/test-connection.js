// Test wallet connection endpoint
const fetch = require('node-fetch');

async function testWalletConnect() {
  try {
    console.log('Testing wallet connect endpoint...');

    const response = await fetch('http://localhost:3001/api/wallet/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-code': 'GMI2025'
      },
      body: JSON.stringify({
        address: 'TEST_ADDRESS',
        type: 'phantom',
        signature: 'TEST_SIGNATURE',
        message: 'TEST_MESSAGE'
      })
    });

    const data = await response.json();

    console.log('\nStatus:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 401 && data.error === 'Invalid signature') {
      console.log('\n✅ Backend is working! (Invalid signature is expected for test data)');
    } else if (response.status === 500) {
      console.log('\n❌ Database connection error!');
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testWalletConnect();
