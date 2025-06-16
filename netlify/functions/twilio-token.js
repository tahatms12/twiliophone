const twilio = require('twilio');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    if (!accountSid || !authToken || !twimlAppSid) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Missing Twilio configuration. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_TWIML_APP_SID environment variables.'
        }),
      };
    }

    // Create access token
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Generate a unique identity for this user session
    const identity = `user_${Date.now()}`;

    // Create an access token
    const accessToken = new AccessToken(accountSid, process.env.TWILIO_API_KEY || accountSid, process.env.TWILIO_API_SECRET || authToken);
    accessToken.identity = identity;

    // Create a Voice grant and add it to the token
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });
    accessToken.addGrant(voiceGrant);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: accessToken.toJwt(),
        identity: identity,
      }),
    };
  } catch (error) {
    console.error('Error generating Twilio token:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate Twilio token',
        details: error.message,
      }),
    };
  }
};