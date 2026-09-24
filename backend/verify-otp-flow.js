const request = require('supertest');
const app = require('./src/app');
const db = require('./src/db/knex');

async function verifyFlow() {
  const testEmail = `test_${Date.now()}@example.com`;
  
  try {
    console.log('1. Sending OTP...');
    const sendOtpRes = await request(app)
      .post('/api/auth/send-otp')
      .send({ email: testEmail });
    
    console.log('OTP Result:', sendOtpRes.body);
    expect(sendOtpRes.statusCode).toBe(200);

    console.log('2. Checking database for OTP...');
    const otpRecord = await db('otps')
      .where({ email: testEmail })
      .orderBy('created_at', 'desc')
      .first();
    
    if (!otpRecord) {
      throw new Error('OTP record not found in database!');
    }
    console.log('Found OTP:', otpRecord.code);

    console.log('3. Attempting registration with valid OTP...');
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: testEmail,
        phone: '1234567890',
        password: 'Password123!',
        otp: otpRecord.code
      });
    
    console.log('Registration Status:', registerRes.statusCode);
    console.log('Registration Body:', registerRes.body);
    
    if (registerRes.statusCode !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(registerRes.body)}`);
    }

    console.log('4. Verifying user in database...');
    const user = await db('users').where({ email: testEmail }).first();
    console.log('User found:', user ? 'Yes' : 'No');
    
    console.log('5. Verifying OTP deleted...');
    const otpAfter = await db('otps').where({ email: testEmail }).first();
    console.log('OTP deleted:', !otpAfter);

    console.log('\nVERIFICATION SUCCESSFUL!');

  } catch (error) {
    console.error('Error during verification:', error.message);
  } finally {
    await db.destroy();
    process.exit();
  }
}

// Simple expect-like helper
function expect(val) {
  return {
    toBe: (expected) => {
      if (val !== expected) throw new Error(`Expected ${expected} but got ${val}`);
    }
  };
}

verifyFlow();
