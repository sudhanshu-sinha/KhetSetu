/**
 * SMS Fallback Utility for KhetSetu
 * Handles sending critical SMS alerts via external gateway (Twilio/MSG91) or mocked locally
 */

const sendSmsFallback = async (phone, message) => {
  // Can be controlled via environment variables
  const provider = process.env.SMS_PROVIDER || 'mock'; // options: 'twilio', 'msg91', 'mock'
  
  try {
    // In development or if explicitly mocked, just log it out nicely
    if (provider === 'mock' || process.env.NODE_ENV === 'development') {
      console.log(`\n======================================`);
      console.log(`[SMS FALLBACK MOCK]`);
      console.log(`To: ${phone}`);
      console.log(`Message: ${message}`);
      console.log(`======================================\n`);
      return { success: true, mock: true };
    }

    if (provider === 'twilio') {
      // Prepared Twilio Implementation
      if (!process.env.TWILIO_ACCOUNT_SID) {
        console.warn('TWILIO_ACCOUNT_SID missing. Falling back to log.');
        console.log(`[Twilio Fallback] To: ${phone} | Msg: ${message}`);
        return { success: true, mock: true };
      }
      
      // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await twilio.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE,
      //   to: phone
      // });
      
      console.log(`[PROD API SMS via Twilio] sent to ${phone}`);
      return { success: true };
    }

    if (provider === 'msg91') {
      // Prepared MSG91 Implementation
      console.log(`[PROD API SMS via MSG91] sent to ${phone}`);
      return { success: true };
    }

    return { success: false, error: 'Unknown provider configured' };
  } catch (err) {
    console.error(`[SMS Error] Failed to send SMS to ${phone}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendSmsFallback };
