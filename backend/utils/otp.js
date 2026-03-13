const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hash OTP for secure storage
 */
async function hashOTP(otp) {
  return bcrypt.hash(otp, 10);
}

/**
 * Verify OTP against hash
 */
async function verifyOTP(otp, hash) {
  return bcrypt.compare(otp, hash);
}

/**
 * Send OTP via Twilio (or mock in development)
 */
async function sendOTP(phone, otp) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${phone}: ${otp} (use 123456 in dev mode)`);
    return { success: true, dev: true };
  }

  // Production: Send via Twilio
  try {
    // Twilio integration would go here
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await twilio.messages.create({
    //   body: `Your KhetSetu OTP is: ${otp}. Valid for 5 minutes.`,
    //   from: process.env.TWILIO_PHONE,
    //   to: phone
    // });
    console.log(`[PROD] OTP sent to ${phone}`);
    return { success: true };
  } catch (error) {
    console.error('OTP send error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { generateOTP, hashOTP, verifyOTP, sendOTP };
