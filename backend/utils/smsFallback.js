/**
 * SMS Utility for KhetSetu
 * Handles Fast2SMS API integration for Indian OTP Delivery
 */

const sendSmsFallback = async (phone, message) => {
  const isDev = process.env.NODE_ENV === 'development';
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (isDev && !apiKey) {
    console.log(`\n======================================`);
    console.log(`[MOCK OTP SMS] To: ${phone}`);
    console.log(`Message: ${message}`);
    console.log(`(Add FAST2SMS_API_KEY in .env to send real SMS)`);
    console.log(`======================================\n`);
    return { success: true, mock: true };
  }

  if (!apiKey) {
    console.warn(`[SMS Warning] No FAST2SMS_API_KEY found, but running in production. Skipping SMS.`);
    return { success: false, error: 'API Key missing' };
  }

  // Remove +91 as Fast2SMS expects 10-digit number
  const normalizedPhone = phone.replace('+91', '').trim();

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: normalizedPhone
      })
    });

    const data = await response.json();

    if (!response.ok || !data.return) {
      throw new Error(data.message || 'SMS delivery failed at gateway');
    }

    console.log(`[FAST2SMS SUCCESS] Sent OTP to ${normalizedPhone} ✓`);
    return { success: true };
    
  } catch (err) {
    console.error(`[FAST2SMS ERROR] Failed to send to ${normalizedPhone}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendSmsFallback };
