# Supabase Setup Guide

## Step 1: Create Database Tables

1. Go to https://app.supabase.com and log in to your project
2. Click **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Copy the entire content of `supabase-migration.sql` from this project
5. Paste it into the SQL editor
6. Click **Run** to execute all migrations

✅ This creates:

- `profiles` table (user info)
- `songs` table (track metadata)
- `scores` table (play results)
- Leaderboard views (daily, weekly, all-time)
- Row Level Security policies
- Auto profile creation trigger on signup

## Step 2: Install Dependencies

```bash
npm install
# or
bun install
```

This installs `@supabase/supabase-js` which we added to package.json

## Step 3: Environment Variables

✅ Already created `.env.local` with your Supabase credentials:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Step 4: Next Frontend Updates

The following files have been created and need to be integrated:

- `src/lib/supabase.ts` - Supabase client
- `src/lib/auth-context.tsx` - Authentication context
- `src/server/auth/signup.ts` - Signup API route
- `src/server/auth/login.ts` - Login API route
- `src/server/api/save-score.ts` - Save score endpoint
- `src/server/api/leaderboard.ts` - Get leaderboard endpoint
- `src/server/api/profile.ts` - Get user profile endpoint

## Step 5: Enable Google Login

1. In Supabase, open **Authentication > Providers**
2. Enable **Google**
3. Add your Google OAuth Client ID and Client Secret
4. In the Google Cloud OAuth client, add the Supabase callback URL shown in the Google provider settings
5. In Supabase **Authentication > URL Configuration**, add your local app URL, for example `http://localhost:5173`, to the allowed redirect URLs

## What This Enables:

✅ User authentication (email/password signup & login)
✅ Single-click Google login and signup
✅ Automatic profile creation on signup
✅ Score saving with automatic song tracking
✅ Star to 10-point rating conversion
✅ Daily/Weekly/All-time leaderboards per song
✅ User profile with join date
✅ Row-level security (users can only see what they should)

## Testing the Setup:

1. Start dev server: `npm run dev`
2. Sign up with an email
3. Play a song and submit your score
4. Check Supabase dashboard to see:
   - Your user in `profiles` table
   - Your score in `scores` table
   - Leaderboard data in the views

## Troubleshooting:

- If SQL fails: Check Supabase dashboard for error details
- If auth fails: Ensure email/password meet requirements (min 6 chars)
- If scores don't save: Check browser console for errors

Let me know once you've completed Step 1 and I'll integrate everything into the UI! 🚀
