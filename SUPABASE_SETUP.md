# Supabase Setup Guide for EduTrack

This guide will walk you through setting up Supabase for authentication, database, and storage for the EduTrack learning portal.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Git installed

## 1. Create a Supabase Project

1. Log in to your Supabase account
2. Click "New Project"
3. Enter a name for your project (e.g., "EduTrack")
4. Set a secure database password
5. Choose a region closest to your users
6. Click "Create new project"

## 2. Set Up Environment Variables

1. In your Supabase project dashboard, go to Settings > API
2. Copy the "Project URL" and "anon public" key
3. Create a `.env` file in the frontend directory based on the `.env.example` template:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 3. Set Up Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Under "Site URL", enter your application's URL (e.g., `http://localhost:5173` for local development)
3. Enable the Email provider under "Email Auth"
4. Optionally, configure additional providers like Google, GitHub, etc.

### Configure Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the templates for Confirmation, Invitation, Magic Link, and Recovery emails

## 4. Set Up Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of the `supabase/schema.sql` file
4. Run the query to create all tables, functions, triggers, and policies

## 5. Set Up Storage

1. Go to Storage in your Supabase dashboard
2. Create the following buckets:
   - `materials`: For storing teaching materials
   - `avatars`: For user profile pictures

### Configure Storage Policies

For the `materials` bucket:

1. Go to the bucket's "Policies" tab
2. Create a policy for uploads:
   - Name: "Teachers can upload materials"
   - Policy definition: `(SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'`
   - Operations: INSERT, UPDATE

3. Create a policy for downloads:
   - Name: "Anyone can download materials"
   - Policy definition: `true`
   - Operations: SELECT

For the `avatars` bucket:

1. Create a policy for uploads:
   - Name: "Users can upload their own avatars"
   - Policy definition: `auth.uid() = storage.foldername`
   - Operations: INSERT, UPDATE

2. Create a policy for downloads:
   - Name: "Anyone can view avatars"
   - Policy definition: `true`
   - Operations: SELECT

## 6. Testing Your Setup

1. Run your frontend application:
   ```
   cd frontend
   npm run dev
   ```

2. Navigate to the sign-in page and test user registration and login
3. Test role-based access by creating both teacher and student accounts

## 7. Supabase Client Integration

The application is already set up with Supabase client integration in `frontend/src/lib/supabaseClient.ts`. This client is used throughout the application for authentication, database queries, and storage operations.

## 8. Row Level Security (RLS)

The database schema includes Row Level Security policies to ensure data access is properly controlled based on user roles. These policies are automatically applied when you run the schema SQL.

## 9. Next Steps

- Implement additional features using the Supabase client
- Set up real-time subscriptions for collaborative features
- Configure Edge Functions for server-side logic if needed
- Set up scheduled functions for recurring tasks

## Troubleshooting

- If you encounter CORS issues, ensure your site URL is correctly set in the Authentication settings
- For database errors, check the SQL logs in the Supabase dashboard
- For authentication issues, verify your environment variables are correctly set