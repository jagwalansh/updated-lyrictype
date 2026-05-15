-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create songs table
CREATE TABLE songs (
  id TEXT PRIMARY KEY,
  artist TEXT NOT NULL,
  track TEXT NOT NULL,
  preview_url TEXT,
  art_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scores table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  rating_out_of_10 NUMERIC(4,2) NOT NULL CHECK (rating_out_of_10 >= 0 AND rating_out_of_10 <= 10),
  accuracy NUMERIC(5,2) NOT NULL,
  consistency NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_song_id ON scores(song_id);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX idx_scores_user_song ON scores(user_id, song_id);

-- Create views for leaderboards
-- Daily leaderboard (last 24 hours)
CREATE VIEW daily_leaderboard AS
SELECT 
  s.song_id,
  sc.user_id,
  p.username,
  MAX(sc.rating_out_of_10) as best_score,
  MAX(sc.accuracy) as best_accuracy,
  sc.created_at
FROM scores sc
JOIN profiles p ON sc.user_id = p.id
JOIN songs s ON sc.song_id = s.id
WHERE sc.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY s.song_id, sc.user_id, p.username, sc.created_at
ORDER BY s.song_id, best_score DESC;

-- Weekly leaderboard (last 7 days)
CREATE VIEW weekly_leaderboard AS
SELECT 
  s.song_id,
  sc.user_id,
  p.username,
  MAX(sc.rating_out_of_10) as best_score,
  MAX(sc.accuracy) as best_accuracy,
  sc.created_at
FROM scores sc
JOIN profiles p ON sc.user_id = p.id
JOIN songs s ON sc.song_id = s.id
WHERE sc.created_at >= NOW() - INTERVAL '7 days'
GROUP BY s.song_id, sc.user_id, p.username, sc.created_at
ORDER BY s.song_id, best_score DESC;

-- All-time leaderboard
CREATE VIEW alltime_leaderboard AS
SELECT 
  s.song_id,
  sc.user_id,
  p.username,
  MAX(sc.rating_out_of_10) as best_score,
  MAX(sc.accuracy) as best_accuracy
FROM scores sc
JOIN profiles p ON sc.user_id = p.id
JOIN songs s ON sc.song_id = s.id
GROUP BY s.song_id, sc.user_id, p.username
ORDER BY s.song_id, best_score DESC;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for scores
CREATE POLICY "Scores are viewable by everyone"
  ON scores FOR SELECT USING (true);

CREATE POLICY "Users can insert their own scores"
  ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scores"
  ON scores FOR SELECT USING (auth.uid() = user_id OR true);

-- RLS Policies for songs
CREATE POLICY "Songs are viewable by everyone"
  ON songs FOR SELECT USING (true);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
