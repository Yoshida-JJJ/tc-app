-- Add shipping details to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_name text,
ADD COLUMN IF NOT EXISTS shipping_postal_code text,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS shipping_phone text;

COMMENT ON COLUMN public.orders.shipping_name IS 'Snapshot of shipping name at purchase time';
COMMENT ON COLUMN public.orders.shipping_address IS 'Snapshot of full address at purchase time';
