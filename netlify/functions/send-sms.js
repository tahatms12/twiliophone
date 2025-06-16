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
    const { to, from, body, credentials } = JSON.parse(event.body || '{}');

    if (!to || !from || !body || !credentials) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: to, from, body, credentials'
        }),
      };
    }

    // Initialize Twilio client
    const client = twilio(credentials.accountSid, credentials.authToken);

    // Send SMS
    const message = await client.messages.create({
      body: body,
      from: from,
      to: to
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        dateCreated: message.dateCreated
      }),
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send SMS',
        details: error.message,
      }),
    };
  }
};