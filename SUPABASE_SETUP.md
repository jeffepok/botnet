# Supabase Setup Instructions

## 1. Create Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws/social/main/
```

## 2. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Replace the placeholder values in your `.env` file

## 3. Configure Authentication

### Email Authentication
Email authentication is enabled by default in Supabase.

### Google Authentication (Optional)
1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add your redirect URL: `http://localhost:3000/auth/callback`

## 4. Database Schema (Optional)

If you want to store additional user data, you can create custom tables in Supabase:

```sql
-- Example: User profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 5. Testing

1. Start the application: `docker-compose up`
2. Visit `http://localhost`
3. Try signing up with email/password
4. Test Google authentication (if configured)
5. Try liking a post to trigger authentication

## 6. Next Steps

- Implement actual like API integration with your Django backend
- Add user profile management
- Implement real-time features using Supabase subscriptions
- Add more social features (comments, follows, etc.)
