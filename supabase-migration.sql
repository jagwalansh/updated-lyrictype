-- Drop existing views to prevent dependency errors when altering tables
DROP VIEW IF EXISTS daily_leaderboard CASCADE;
DROP VIEW IF EXISTS weekly_leaderboard CASCADE;
DROP VIEW IF EXISTS alltime_leaderboard CASCADE;

-- Drop old scores table to recreate with raw integer score
DROP TABLE IF EXISTS scores CASCADE;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create songs table if it doesn't exist
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  artist TEXT NOT NULL,
  track TEXT NOT NULL,
  preview_url TEXT,
  art_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scores table with the raw integer score column
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  consistency NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_song UNIQUE (user_id, song_id)
);

-- Create community votes for which YouTube video best matches a song's synced lyrics
CREATE TABLE IF NOT EXISTS song_video_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  vote SMALLINT NOT NULL DEFAULT 1 CHECK (vote = 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_song_video_vote UNIQUE (user_id, song_id, video_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_song_id ON scores(song_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scores_user_song ON scores(user_id, song_id);
CREATE INDEX IF NOT EXISTS idx_song_video_votes_song_id ON song_video_votes(song_id);
CREATE INDEX IF NOT EXISTS idx_song_video_votes_song_video ON song_video_votes(song_id, video_id);

-- Create views for leaderboards
-- Daily leaderboard (last 24 hours)
CREATE VIEW daily_leaderboard AS
SELECT 
  sc.song_id,
  s.artist,
  s.track,
  s.art_url,
  sc.user_id,
  p.username,
  MAX(sc.score) as best_score,
  MAX(sc.accuracy) as best_accuracy,
  sc.created_at
FROM scores sc
JOIN profiles p ON sc.user_id = p.id
JOIN songs s ON sc.song_id = s.id
WHERE sc.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY sc.song_id, s.artist, s.track, s.art_url, sc.user_id, p.username, sc.created_at
ORDER BY best_score DESC;

-- Weekly leaderboard (last 7 days)
CREATE VIEW weekly_leaderboard AS
SELECT 
  sc.song_id,
  s.artist,
  s.track,
  s.art_url,
  sc.user_id,
  p.username,
  MAX(sc.score) as best_score,
  MAX(sc.accuracy) as best_accuracy,
  sc.created_at
FROM scores sc
JOIN profiles p ON sc.user_id = p.id
JOIN songs s ON sc.song_id = s.id
WHERE sc.created_at >= NOW() - INTERVAL '7 days'
GROUP BY sc.song_id, s.artist, s.track, s.art_url, sc.user_id, p.username, sc.created_at
ORDER BY best_score DESC;

-- All-time leaderboard
CREATE VIEW alltime_leaderboard AS
SELECT 
  sc.song_id,
  s.artist,
  s.track,
  s.art_url,
  sc.user_id,
  p.username,
  MAX(sc.score) as best_score,
  MAX(sc.accuracy) as best_accuracy
FROM scores sc
JOIN profiles p ON sc.user_id = p.id
JOIN songs s ON sc.song_id = s.id
GROUP BY sc.song_id, s.artist, s.track, s.art_url, sc.user_id, p.username
ORDER BY best_score DESC;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_video_votes ENABLE ROW LEVEL SECURITY;

DELETE FROM song_video_votes WHERE vote <> 1;
ALTER TABLE song_video_votes DROP CONSTRAINT IF EXISTS song_video_votes_vote_check;
ALTER TABLE song_video_votes ALTER COLUMN vote SET DEFAULT 1;
ALTER TABLE song_video_votes ADD CONSTRAINT song_video_votes_vote_check CHECK (vote = 1);

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for scores
DROP POLICY IF EXISTS "Scores are viewable by everyone" ON scores;
CREATE POLICY "Scores are viewable by everyone"
  ON scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own scores" ON scores;
CREATE POLICY "Users can insert their own scores"
  ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own scores" ON scores;
CREATE POLICY "Users can view their own scores"
  ON scores FOR SELECT USING (auth.uid() = user_id OR true);

-- RLS Policies for songs
DROP POLICY IF EXISTS "Songs are viewable by everyone" ON songs;
CREATE POLICY "Songs are viewable by everyone"
  ON songs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Songs are insertable by everyone" ON songs;
CREATE POLICY "Songs are insertable by everyone"
  ON songs FOR INSERT WITH CHECK (true);

-- RLS Policies for video sync votes
DROP POLICY IF EXISTS "Video votes are viewable by everyone" ON song_video_votes;

DROP POLICY IF EXISTS "Users can view their own video votes" ON song_video_votes;
CREATE POLICY "Users can view their own video votes"
  ON song_video_votes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own video votes" ON song_video_votes;
CREATE POLICY "Users can insert their own video votes"
  ON song_video_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own video votes" ON song_video_votes;
CREATE POLICY "Users can update their own video votes"
  ON song_video_votes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own video votes" ON song_video_votes;
CREATE POLICY "Users can delete their own video votes"
  ON song_video_votes FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_song_video_vote_scores(p_song_id TEXT)
RETURNS TABLE (
  video_id TEXT,
  upvotes BIGINT,
  user_upvoted BOOLEAN
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    votes.video_id,
    COUNT(*) AS upvotes,
    COALESCE(BOOL_OR(votes.user_id = auth.uid()), FALSE) AS user_upvoted
  FROM public.song_video_votes AS votes
  WHERE votes.song_id = p_song_id
  GROUP BY votes.video_id;
$$;

REVOKE ALL ON FUNCTION public.get_song_video_vote_scores(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_song_video_vote_scores(TEXT) TO anon, authenticated;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      NULLIF(new.raw_user_meta_data->>'username', ''),
      split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 8)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Keep profile email in sync if the auth email changes later
CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = new.email,
      updated_at = NOW()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (old.email IS DISTINCT FROM new.email)
  EXECUTE FUNCTION public.handle_user_email_update();

-- Create function to handle score saving logic (enforce high-score only and top 50 limit)
CREATE OR REPLACE FUNCTION public.save_user_score(
  p_user_id UUID,
  p_song_id TEXT,
  p_score INTEGER,
  p_accuracy NUMERIC,
  p_consistency NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_existing_id UUID;
  v_existing_score INTEGER;
  v_count INTEGER;
  v_min_score INTEGER;
  v_min_id UUID;
  v_result JSONB;
BEGIN
  -- 1. Check if this user already has a score for this song
  SELECT id, score INTO v_existing_id, v_existing_score
  FROM public.scores
  WHERE user_id = p_user_id AND song_id = p_song_id
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- If they have an existing score, and the new score is better, update it
    IF p_score > v_existing_score THEN
      UPDATE public.scores
      SET score = p_score,
          accuracy = p_accuracy,
          consistency = p_consistency,
          created_at = NOW()
      WHERE id = v_existing_id;
      
      v_result := jsonb_build_object('status', 'updated', 'score', p_score);
    ELSE
      v_result := jsonb_build_object('status', 'not_better', 'score', v_existing_score);
    END IF;
  ELSE
    -- 2. If they don't have an existing score, check if the leaderboard is full (50 scores)
    SELECT COUNT(*) INTO v_count
    FROM public.scores
    WHERE song_id = p_song_id;

    IF v_count < 50 THEN
      -- If fewer than 50, just insert
      INSERT INTO public.scores (user_id, song_id, score, accuracy, consistency)
      VALUES (p_user_id, p_song_id, p_score, p_accuracy, p_consistency);
      
      v_result := jsonb_build_object('status', 'inserted', 'score', p_score);
    ELSE
      -- Find the lowest score in the top 50
      SELECT id, score INTO v_min_id, v_min_score
      FROM public.scores
      WHERE song_id = p_song_id
      ORDER BY score DESC, created_at ASC
      OFFSET 49
      LIMIT 1;

      -- If the new score is better than the 50th score, insert it and delete the old 50th score (or any scores below top 50)
      IF p_score > v_min_score THEN
        -- Insert the new score
        INSERT INTO public.scores (user_id, song_id, score, accuracy, consistency)
        VALUES (p_user_id, p_song_id, p_score, p_accuracy, p_consistency);

        -- Delete scores that are outside the top 50 for this song
        DELETE FROM public.scores
        WHERE id IN (
          SELECT id
          FROM public.scores
          WHERE song_id = p_song_id
          ORDER BY score DESC, created_at ASC
          OFFSET 50
        );

        v_result := jsonb_build_object('status', 'inserted_and_pruned', 'score', p_score);
      ELSE
        v_result := jsonb_build_object('status', 'not_in_top_50', 'score', p_score);
      END IF;
    END IF;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.save_user_score TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_user_score TO service_role;

-- Force PostgREST to reload schema cache to pick up table changes immediately
NOTIFY pgrst, 'reload schema';

