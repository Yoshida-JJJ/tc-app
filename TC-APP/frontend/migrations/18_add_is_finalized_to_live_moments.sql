-- Migration: Add Finalized Flag to Live Moments
-- Created at: 2025-12-16
ALTER TABLE public.live_moments
ADD COLUMN IF NOT EXISTS is_finalized boolean DEFAULT false;
COMMENT ON COLUMN public.live_moments.is_finalized IS 'True if the match event has concluded and score is final.';