-- Migration: Debug Helper (Expose Indexes)
-- Creates an RPC to list indexes for debugging purposes.
CREATE OR REPLACE FUNCTION get_indexes_debug(p_table_name text) RETURNS TABLE (index_name text, index_definition text) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT i.indexname::text,
    i.indexdef::text
FROM pg_indexes i
WHERE i.tablename = p_table_name
    AND i.schemaname = 'public';
END;
$$;