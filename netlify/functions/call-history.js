const twilio = require('twilio');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { accountSid, authToken, phoneNumber } = JSON.parse(event.body || '{}');

    if (!accountSid || !authToken || !phoneNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required credentials'
        }),
      };
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Fetch call history
    const calls = await client.calls.list({
      limit: 20,
      // Filter by phone number (both from and to)
    });

    // Transform calls to our format
    const callHistory = calls.map(call => ({
      id: call.sid,
      to: call.to,
      from: call.from,
      status: call.status,
      direction: call.direction,
      duration: call.duration,
      timestamp: new Date(call.dateCreated)
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        calls: callHistory
      }),
    };
  } catch (error) {
    console.error('Error fetching call history:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch call history',
        details: error.message,
      }),
    };
  }
};