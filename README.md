# Twilio Phone Frontend

A modern React-based phone interface that integrates with Twilio Voice API through Netlify Functions.

## Features

- 🎨 Modern, responsive phone interface
- 📞 Make outbound calls using Twilio Voice
- 🔐 Secure token management via Netlify Functions
- ⚡ Built with React, TypeScript, and Tailwind CSS
- 🎯 Real-time call status updates

## Setup

### Prerequisites

1. A Twilio account with Voice API enabled
2. A Netlify account for hosting and serverless functions

### Environment Variables

Set the following environment variables in your Netlify dashboard:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_TWIML_APP_SID=your_twiml_app_sid
```

Optional (for enhanced security):
```
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
```

### Twilio Configuration

1. Create a TwiML Application in your Twilio Console
2. Set up a phone number for outbound calls
3. Configure your TwiML Application with appropriate webhook URLs

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. For local testing with Netlify Functions, use:
   ```bash
   netlify dev
   ```

## Usage

1. Enter a phone number using the keypad
2. Click "Call" to initiate an outbound call
3. Use "Hang Up" to end the call
4. The interface shows connection status and call progress

## Architecture

- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend**: Netlify Functions for secure token generation
- **Voice**: Twilio Voice SDK for WebRTC calling
- **Deployment**: Netlify for both frontend and serverless functions

## Security

- API tokens are generated server-side and never exposed to the client
- All Twilio credentials are stored as environment variables
- CORS is properly configured for cross-origin requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details