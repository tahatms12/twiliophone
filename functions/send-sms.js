const twilio = require('twilio');

exports.handler = async (event) => {
  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const message = await client.messages.create({
      body: data.message,
      to: data.to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return {
      statusCode: 200,
      body: JSON.stringify(message)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
