# Supabase Setup Instructions

## Overview

This project has been configured with Supabase for authentication and database functionality. Follow these steps to complete the setup.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Create a new project
3. Choose your organization and give your project a name
4. Set a database password (save this securely)
5. Choose a region close to your users
6. Wait for the project to be created

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)
   - **Service role key** (starts with `eyJ...` - keep this secret!)

## 3. Configure Environment Variables

1. Copy `env.example` to `.env.local`:

   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key_here"
   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
   ```

## 4. Configure Authentication Providers (Optional)

### Google OAuth Setup

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
4. Copy the Client ID and Client Secret to Supabase

### Email Authentication

Email authentication is enabled by default. Users can sign up and sign in with email/password.

## 5. Database Setup (Optional)

If you need to store additional user data, you can create tables in the Supabase dashboard:

1. Go to **Table Editor** in your Supabase dashboard
2. Create tables as needed
3. Set up Row Level Security (RLS) policies

## 6. Test the Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`
3. Try signing up with a new email
4. Try signing in with Google (if configured)
5. Check that the user appears in the sidebar

## 7. Production Deployment

When deploying to production:

1. Update your environment variables in your hosting platform
2. Add your production domain to Supabase's allowed origins
3. Update OAuth redirect URIs if using Google auth

## Features Implemented

- ✅ Email/password authentication
- ✅ Google OAuth authentication (when configured)
- ✅ Protected routes with middleware
- ✅ User context and state management
- ✅ Sign out functionality
- ✅ User profile display in sidebar

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**: Check that your environment variables are correct
2. **OAuth redirect errors**: Ensure redirect URIs are properly configured
3. **CORS errors**: Make sure your domain is added to Supabase's allowed origins

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
