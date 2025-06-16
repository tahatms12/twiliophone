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

    // Fetch message history
    const messages = await client.messages.list({
      limit: 20,
      // Filter by phone number (both from and to)
    });

    // Transform messages to our format
    const messageHistory = messages.map(message => ({
      id: message.sid,
      to: message.to,
      from: message.from,
      body: message.body,
      direction: message.direction,
      status: message.status,
      timestamp: new Date(message.dateCreated)
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        messages: messageHistory
      }),
    };
  } catch (error) {
    console.error('Error fetching message history:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch message history',
        details: error.message,
      }),
    };
  }
};