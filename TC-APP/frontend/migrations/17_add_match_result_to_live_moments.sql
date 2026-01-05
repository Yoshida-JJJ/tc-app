-- Migration: Add Match Result to Live Moments
-- Created at: 2025-12-16
ALTER TABLE public.live_moments
ADD COLUMN IF NOT EXISTS match_result text;
COMMENT ON COLUMN public.live_moments.match_result IS 'Score or Matchup details (e.g. "LAD 6 - 3 NYY")';