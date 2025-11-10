/**
 * Test script for API Key Rotation System
 */

import { getRotationManager, callWithRotation } from '../lib/ai/api-key-rotation';

async function testRotation() {
  console.log(' Testing API Key Rotation System\n');

  const manager = getRotationManager();

  // Test 1: Get initial stats
  console.log(' Initial Stats:');
  console.log(JSON.stringify(manager.getStats(), null, 2));
  console.log('');

  // Test 2: Successful API call
  console.log(' Test 2: Successful API call');
  try {
    const result = await callWithRotation(async (client) => {
      return await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: 'Say "Hello from API rotation test!"' }],
        max_tokens: 50
      });
    });
    console.log('Response:', result.choices[0].message.content);
    console.log('');
  } catch (error: any) {
    console.error('Error:', error.message);
  }

  // Test 3: Check stats after success
  console.log(' Stats after successful call:');
  console.log(JSON.stringify(manager.getStats(), null, 2));
  console.log('');

  // Test 4: Simulate quota error
  console.log(' Test 4: Simulate quota error');
  manager.reportError('insufficient_quota: You exceeded your current quota');
  console.log('Reported quota error');
  console.log('');

  // Test 5: Check stats after error
  console.log(' Stats after quota error:');
  console.log(JSON.stringify(manager.getStats(), null, 2));
  console.log('');

  // Test 6: Try API call again (should use backup key)
  console.log(' Test 6: API call after rotation');
  try {
    const result = await callWithRotation(async (client) => {
      return await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: 'Say "Hello from backup key!"' }],
        max_tokens: 50
      });
    });
    console.log('Response:', result.choices[0].message.content);
    console.log('');
  } catch (error: any) {
    console.error('Error:', error.message);
  }

  // Test 7: Final stats
  console.log(' Final Stats:');
  console.log(JSON.stringify(manager.getStats(), null, 2));
  console.log('');

  console.log(' API Key Rotation Test Complete!');
}

// Run test
testRotation().catch(console.error);
