-- Migration: Debug Helper (Expose Policies)
-- Creates an RPC to list policies for debugging purposes.
CREATE OR REPLACE FUNCTION get_policies_debug() RETURNS TABLE (
        tablename text,
        policyname text,
        definition text
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT p.tablename::text,
    p.policyname::text,
    p.definition::text
FROM pg_policies p
WHERE p.schemaname = 'public';
END;
$$;