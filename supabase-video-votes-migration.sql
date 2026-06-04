-- Community votes for which YouTube video best matches a song's synced lyrics.
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

CREATE INDEX IF NOT EXISTS idx_song_video_votes_song_id ON song_video_votes(song_id);
CREATE INDEX IF NOT EXISTS idx_song_video_votes_song_video ON song_video_votes(song_id, video_id);

ALTER TABLE song_video_votes ENABLE ROW LEVEL SECURITY;

DELETE FROM song_video_votes WHERE vote <> 1;
ALTER TABLE song_video_votes DROP CONSTRAINT IF EXISTS song_video_votes_vote_check;
ALTER TABLE song_video_votes ALTER COLUMN vote SET DEFAULT 1;
ALTER TABLE song_video_votes ADD CONSTRAINT song_video_votes_vote_check CHECK (vote = 1);

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
