const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendSmsFallback } = require('./smsFallback');

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
 * Send OTP using SMS Fallback Service
 */
async function sendOTP(phone, otp) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${phone}: ${otp} (use 123456 in dev mode)`);
  }

  // Dispatch to centralized SMS Fallback service
  const message = `Your KhetSetu OTP is: ${otp}. Valid for 5 minutes.`;
  return await sendSmsFallback(phone, message);
}

module.exports = { generateOTP, hashOTP, verifyOTP, sendOTP };
