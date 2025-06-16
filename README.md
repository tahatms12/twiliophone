# Twiliophone

Bare-bones phone interface using the Twilio Voice and Conversations SDKs.

## Environment Variables

Create a `.env` file based on `.env.sample` with the following values:

- `REACT_APP_TWILIO_ACCESS_TOKEN_SERVER_URL` – Endpoint that returns a Twilio access token for Voice and Conversations.
- `REACT_APP_TWILIO_CONVERSATIONS_SERVICE_SID` – Conversations service identifier used for SMS.
- `REACT_APP_TWILIO_CSV_FILENAME` – Filename used when downloading the activity log as CSV.

These variables are consumed by the app at runtime and should be prefixed with `REACT_APP_` so Create React App exposes them.

## Development

```bash
npm install
npm start
```

To create a production build:

```bash
npm run build
```
