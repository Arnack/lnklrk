# Gmail Integration Setup

This guide will help you set up Gmail integration for your influencer outreach system.

## Prerequisites

1. A Google Cloud Platform account
2. A Gmail account for sending/receiving emails

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Gmail API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" and then "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required fields (app name, user support email, developer contact)
   - Add your domain if you have one, or use localhost for development
   - Add the following scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
4. For application type, choose "Web application"
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/gmail/callback`
   - For production: `https://yourdomain.com/auth/gmail/callback`
6. Click "Create"
7. Save the Client ID and Client Secret

## Step 4: Configure Environment Variables

Create a `.env.local` file in your project root with the following:

```env
# Gmail API Configuration (Client-side)
NEXT_PUBLIC_GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GMAIL_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_GMAIL_REDIRECT_URI=http://localhost:3000/auth/gmail/callback
NEXT_PUBLIC_GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send
```

Replace the placeholder values with your actual credentials from Step 3.

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to an influencer's profile in your app
3. Click "Connect Gmail" in the Message Log component
4. Complete the OAuth flow
5. Try syncing emails and sending a test email

## Security Notes

- Keep your Client Secret secure and never commit it to version control
- The `NEXT_PUBLIC_` prefix means these variables are exposed to the client-side
- In production, consider implementing additional security measures like:
  - CORS restrictions
  - Rate limiting
  - Token rotation
  - Webhook verification

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in your OAuth client matches exactly what's in your .env.local
   - Check for trailing slashes or protocol mismatches

2. **"access_denied" error**
   - Make sure your OAuth consent screen is properly configured
   - Check that the required scopes are added

3. **"invalid_grant" error**
   - This usually means the authorization code has expired
   - Try the authentication flow again

4. **CORS errors**
   - This is expected since we're making client-side requests to Google's APIs
   - The googleapis library handles this properly

### Development vs Production

For development:
- Use `http://localhost:3000/auth/gmail/callback`
- You can test with your own Gmail account

For production:
- Use your actual domain: `https://yourdomain.com/auth/gmail/callback`
- Consider setting up a service account for server-side operations
- Implement proper error handling and retry logic

## Features Included

- ✅ OAuth 2.0 authentication with Gmail
- ✅ Fetch email conversations with specific contacts
- ✅ Send emails through Gmail API
- ✅ Automatic token refresh
- ✅ Persistent authentication (localStorage)
- ✅ Error handling and retry logic
- ✅ Integration with existing message log component

## Usage

Once set up, users can:

1. **Connect Gmail**: Click the "Connect Gmail" button to authenticate
2. **Sync Emails**: Automatically or manually sync email conversations
3. **Send Emails**: Compose and send emails directly from the app
4. **View History**: See all email conversations in a unified timeline
5. **Manual Logging**: Still able to manually add messages when needed 