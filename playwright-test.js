const { chromium } = require('playwright');
const fs = require('fs');

async function runParaBankTest() {
  console.log('🚀 Starting ParaBank Registration Test...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let testResults = {
    testCase: 'TC 001 - User Registration',
    status: 'FAILED',
    steps: [],
    startTime: new Date().toISOString(),
    errors: []
  };
  
  try {
    // Step 1: Navigate to ParaBank
    console.log('📍 Step 1: Navigating to ParaBank...');
    await page.goto('https://parabank.parasoft.com/parabank/index.htm', { waitUntil: 'networkidle' });
    testResults.steps.push({ step: 1, description: 'Navigate to ParaBank', status: 'PASSED' });
    
    // Step 2: Click Register
    console.log('🔗 Step 2: Clicking Register link...');
    await page.click('a[href="register.htm"]');
    await page.waitForLoadState('networkidle');
    testResults.steps.push({ step: 2, description: 'Click Register link', status: 'PASSED' });
    
    // Step 3: Fill form
    console.log('📝 Step 3: Filling registration form...');
    const username = 'testuser' + Date.now().toString().slice(-4);
    
    await page.fill('#customer\\.firstName', 'John');
    await page.fill('#customer\\.lastName', 'Doe');
    await page.fill('#customer\\.address\\.street', '123 Main St');
    await page.fill('#customer\\.address\\.city', 'New York');
    await page.fill('#customer\\.address\\.state', 'NY');
    await page.fill('#customer\\.address\\.zipCode', '10001');
    await page.fill('#customer\\.phoneNumber', '555-1234');
    await page.fill('#customer\\.ssn', '123-45-6789');
    await page.fill('#customer\\.username', username);
    await page.fill('#customer\\.password', 'Password123');
    await page.fill('#repeatedPassword', 'Password123');
    
    testResults.steps.push({ step: 3, description: `Fill form with username: ${username}`, status: 'PASSED' });
    
    // Step 4: Submit
    console.log('✅ Step 4: Submitting form...');
    await page.click('input[value="Register"]');
    await page.waitForLoadState('networkidle');
    testResults.steps.push({ step: 4, description: 'Submit registration form', status: 'PASSED' });
    
    // Step 5: Verify
    console.log('🔍 Step 5: Verifying welcome message...');
    await page.waitForSelector('h1', { timeout: 10000 });
    const welcomeText = await page.textContent('h1');
    
    if (welcomeText && welcomeText.includes(username)) {
      testResults.steps.push({ step: 5, description: `Verify welcome message for ${username}`, status: 'PASSED', details: welcomeText });
      testResults.status = 'PASSED';
      console.log('✅ TEST PASSED!');
    } else {
      throw new Error(`Welcome verification failed. Found: ${welcomeText}`);
    }
    
    // Screenshot
    await page.screenshot({ path: 'success.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    testResults.errors.push(error.message);
    await page.screenshot({ path: 'failure.png', fullPage: true });
  }
  
  testResults.endTime = new Date().toISOString();
  await browser.close();
  
  // Save results
  fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
  
  // Output summary
  console.log('\n📊 TEST SUMMARY:');
  console.log(`Status: ${testResults.status}`);
  console.log(`Steps: ${testResults.steps.length}`);
  console.log(`Errors: ${testResults.errors.length}`);
  
  return testResults.status === 'PASSED' ? 0 : 1;
}

runParaBankTest().then(exitCode => process.exit(exitCode));