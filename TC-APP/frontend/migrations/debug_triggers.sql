-- Migration: Debug Helper (Expose Triggers)
-- Creates an RPC to list triggers for debugging purposes.
CREATE OR REPLACE FUNCTION get_triggers_debug() RETURNS TABLE (
        trigger_name text,
        event_manipulation text,
        event_object_table text,
        action_statement text
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT t.trigger_name::text,
    t.event_manipulation::text,
    t.event_object_table::text,
    t.action_statement::text
FROM information_schema.triggers t
WHERE t.event_object_schema = 'public';
END;
$$;