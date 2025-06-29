# Environment Variables Setup Guide

This guide will help you set up all the required environment variables for the Real Estate Report Tool.

## Required Environment Variables

### 1. Supabase Configuration

**What it's for**: Database, authentication, and real-time features

**How to get it**:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use existing one
3. Go to Settings > API
4. Copy the following values:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep secret!)
   - `SUPABASE_JWT_SECRET`: Found in Settings > API > JWT Settings

### 2. Google Maps API

**What it's for**: Address autocomplete, geocoding, and map display

**How to get it**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Go to Credentials > Create Credentials > API Key
5. Copy the API key as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

**Important**: Restrict your API key to your domain for security!

### 3. OpenAI API

**What it's for**: AI-powered report generation and analysis

**How to get it**:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key as `OPENAI_API_KEY`

**Note**: You'll need to add billing information to use the API.

### 4. Database Configuration (Optional)

If you're using a separate Postgres database (like Neon), you'll need:
- `POSTGRES_URL`: Your database connection string
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_HOST`: Database host
- `POSTGRES_DATABASE`: Database name

### 5. Screenshot & Color Extraction

**What it's for**: Taking a headless screenshot of realtor websites and extracting their dominant colors.

**Dependencies**: `puppeteer` and `colorthief` are installed with project dependencies. No API keys are required.

**Optional**: In certain hosting environments you may need to set `PUPPETEER_EXECUTABLE_PATH` to your Chromium binary location.

## Setup Instructions

1. Copy `.env.example` to `.env.local`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Fill in all the values in `.env.local` with your actual API keys

3. Never commit `.env.local` to version control (it's in .gitignore)

4. For production deployment, add these environment variables to your hosting platform (Vercel, Netlify, etc.)

## Testing Your Setup

Run the development server to test if everything is configured correctly:

\`\`\`bash
yarn dev
\`\`\`

If you see any environment variable errors, double-check your `.env.local` file.

## Security Notes

- Never share your `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY`
- Use environment variable restrictions where possible
- Regularly rotate your API keys
- Monitor your API usage to detect any unauthorized access
