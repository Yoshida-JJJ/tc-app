-- Add 'Incoming' to listing_status_enum to support purchased items in transit
-- This is necessary because the column is an ENUM and 'Incoming' was newly introduced.
ALTER TYPE public.listing_status_enum
ADD VALUE IF NOT EXISTS 'Incoming';