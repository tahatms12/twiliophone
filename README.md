# Twiliophone

Bare-bones phone interface using the Twilio Voice and Conversations SDKs.

## Environment Variables

Copy `.env.sample` to `.env` and fill in values locally or define them in your
Netlify project's **Environment variables** section:

- `REACT_APP_TWILIO_ACCESS_TOKEN_SERVER_URL` – Endpoint that returns a Twilio access token for Voice and Conversations.
- `REACT_APP_TWILIO_CONVERSATIONS_SERVICE_SID` – Conversations service identifier used for SMS.
- `REACT_APP_TWILIO_CSV_FILENAME` – Filename used when downloading the activity log as CSV.

These variables are embedded during the build.  Rebuild the site after updating
values so the new settings take effect.

## Development

```bash
npm install
npm start
```

To create a production build:

```bash
npm run build
```
