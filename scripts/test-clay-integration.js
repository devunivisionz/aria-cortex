/**
 * Clay Integration Test Script
 * 
 * This script tests the Clay integration endpoints
 * Usage: node scripts/test-clay-integration.js
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zhmalcapsmcvvhyrcicm.supabase.co';
const BASE_URL = `${SUPABASE_URL}/functions/v1/clay-integration`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  log(`\n🧪 Testing: ${name}`, colors.cyan);
  log(`   URL: ${url}`, colors.yellow);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      log(`✅ Success (${response.status})`, colors.green);
      console.log('   Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      log(`❌ Failed (${response.status})`, colors.red);
      console.log('   Error:', JSON.stringify(data, null, 2));
      return { success: false, error: data };
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('🎨 Clay Integration Test Suite', colors.cyan);
  log('================================\n', colors.cyan);

  // Test 1: Check Status
  await testEndpoint(
    'Check Integration Status',
    `${BASE_URL}/status`
  );

  // Test 2: Send Data to Clay (will fail if CLAY_WEBHOOK_URL not set)
  await testEndpoint(
    'Send Data to Clay',
    `${BASE_URL}/send`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: 'Test Company',
        website: 'https://test.com',
        industry: 'Technology',
        test: true,
      }),
    }
  );

  // Test 3: Webhook Endpoint (simulate Clay sending data)
  await testEndpoint(
    'Receive Webhook from Clay',
    `${BASE_URL}/webhook`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: 't_0t58htaPzJySmBRUWUx',
        rowId: 'test_row_' + Date.now(),
        data: {
          company_name: 'Test Company from Clay',
          email: 'test@example.com',
          enriched_at: new Date().toISOString(),
        },
      }),
    }
  );

  // Test 4: Sync Data (will attempt to sync companies)
  await testEndpoint(
    'Sync Companies to Clay',
    `${BASE_URL}/sync?limit=5`
  );

  log('\n✨ Test suite completed!', colors.green);
  log('\n📝 Notes:', colors.yellow);
  log('- If "Send Data to Clay" fails, make sure CLAY_WEBHOOK_URL is configured');
  log('- If "Sync Companies" fails, check if you have companies in your database');
  log('- Check Supabase Edge Function logs for detailed error messages');
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, colors.red);
  process.exit(1);
});
