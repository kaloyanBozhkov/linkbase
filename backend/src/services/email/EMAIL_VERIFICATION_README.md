# Email Verification System

This document describes the email verification system implemented for Linkbase.

## Overview

The email verification system allows users to verify their email addresses for SSO (Single Sign-On) recovery and cross-device synchronization.

## Components

### 1. Email Service (`src/services/email.ts`)
- Uses Resend for sending emails
- Implements encryption/decryption for verification tokens
- Creates beautiful HTML email templates

### 2. Backend Endpoints
- `POST /api/trpc/linkbase.users.sendVerificationEmail` - Sends verification email
- `GET /verify-email` - Handles email verification via token
- `GET /email-verification.html` - Serves verification result page

### 3. Frontend Integration
- Updated `SyncScreen.tsx` to send verification emails
- Deep linking support for handling verification redirects
- Automatic email state management

## Environment Variables Required

Add these to your `.env` file:

```env
# Email Service (Resend)
RESEND_API_KEY="your_resend_api_key_here"

# Email Encryption (32 characters)
EMAIL_ENCRYPTION_KEY="your-secret-key-32-chars-long!!"

# Base URL for email verification links
BASE_URL="https://your-domain.com"
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   pnpm add resend crypto-js
   ```

2. **Configure Resend**
   - Sign up at [resend.com](https://resend.com)
   - Get your API key
   - Add it to your environment variables

3. **Set Encryption Key**
   - Generate a 32-character secret key
   - Add it to your environment variables

4. **Configure Base URL**
   - Set your domain in the BASE_URL environment variable

## Flow

1. User enters email in Sync screen
2. App calls `sendVerificationEmail` mutation
3. Backend sends email with encrypted verification token
4. User clicks link in email
5. Backend decrypts token and processes verification
6. User is redirected to app via deep link
7. App updates local email state

## Security Features

- Encrypted verification tokens using AES-256-CBC
- 24-hour token expiration
- Secure token generation with random IV
- Input validation and error handling

## Email Template

The verification email includes:
- Clear explanation of the verification purpose
- Benefits of email verification
- Secure verification button
- Security warnings
- Support contact information

## Deep Linking

The app uses the `linkbase://` scheme for deep linking:
- `linkbase://sync?verified=true&email=user@example.com`

This allows seamless app opening after email verification. 