-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  CONSTRAINT notifications_profile_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS notifications_profile_id_idx ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(profile_id, is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_profile_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    profile_id,
    type,
    title,
    message,
    related_entity_type,
    related_entity_id,
    metadata
  )
  VALUES (
    p_profile_id,
    p_type,
    p_title,
    p_message,
    p_related_entity_type,
    p_related_entity_id,
    p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger 1: Coach comments on session
-- This will trigger when a coach adds a comment/note to a workout session
-- For now, we'll use a trigger on workout_sessions_log when notes are updated
-- Note: This assumes there's a notes field on workout_sessions_log or we track comments separately
-- For MVP, we'll create a trigger that fires when workout_sessions_log is updated with notes

CREATE OR REPLACE FUNCTION notify_coach_comment_on_session()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_client_id UUID;
  v_client_profile_id UUID;
  v_session_name TEXT;
  v_coach_name TEXT;
BEGIN
  -- Only trigger if notes were added/changed and coach_id is set
  IF NEW.notes IS NOT NULL AND NEW.notes != '' AND NEW.notes IS DISTINCT FROM OLD.notes THEN
    -- Get client profile_id
    SELECT profile_id INTO v_client_profile_id
    FROM clients
    WHERE id = NEW.client_id;
    
    IF v_client_profile_id IS NOT NULL THEN
      -- Get session name
      SELECT name INTO v_session_name
      FROM program_sessions
      WHERE id = NEW.program_session_id;
      
      -- Get coach name
      SELECT full_name INTO v_coach_name
      FROM profiles
      WHERE id = (
        SELECT primary_coach_id
        FROM clients
        WHERE id = NEW.client_id
      );
      
      -- Create notification for client
      PERFORM create_notification(
        v_client_profile_id,
        'coach_comment',
        'Din coach har kommenterat ditt pass',
        COALESCE(v_coach_name, 'Din coach') || ' har lagt till en kommentar på passet "' || COALESCE(v_session_name, 'ditt pass') || '".',
        'workout_session_log',
        NEW.id,
        jsonb_build_object('session_name', v_session_name, 'date', NEW.date)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Note: This trigger assumes workout_sessions_log has a notes field
-- If it doesn't exist, we need to add it or use a different approach
-- For now, we'll comment this out and create it manually when the field exists
-- CREATE TRIGGER trigger_coach_comment_on_session
--   AFTER UPDATE OF notes ON workout_sessions_log
--   FOR EACH ROW
--   WHEN (NEW.notes IS NOT NULL AND NEW.notes != '' AND NEW.notes IS DISTINCT FROM OLD.notes)
--   EXECUTE FUNCTION notify_coach_comment_on_session();

-- Trigger 2: Client logs session (notify coach)
CREATE OR REPLACE FUNCTION notify_client_logged_session()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_coach_profile_id UUID;
  v_client_name TEXT;
  v_session_name TEXT;
BEGIN
  -- Only trigger when status is 'genomfört' (completed)
  -- For INSERT: OLD is NULL, so we check if NEW.status is 'genomfört'
  -- For UPDATE: We check if status changed to 'genomfört'
  IF NEW.status = 'genomfört' AND (TG_OP = 'INSERT' OR OLD.status IS NULL OR OLD.status != 'genomfört') THEN
    -- Get coach profile_id
    SELECT primary_coach_id INTO v_coach_profile_id
    FROM clients
    WHERE id = NEW.client_id;
    
    IF v_coach_profile_id IS NOT NULL THEN
      -- Get client name
      SELECT full_name INTO v_client_name
      FROM profiles
      WHERE id = (
        SELECT profile_id
        FROM clients
        WHERE id = NEW.client_id
      );
      
      -- Get session name
      SELECT name INTO v_session_name
      FROM program_sessions
      WHERE id = NEW.program_session_id;
      
      -- Create notification for coach
      PERFORM create_notification(
        v_coach_profile_id,
        'client_workout_logged',
        'Klient har loggat pass',
        COALESCE(v_client_name, 'En klient') || ' har genomfört passet "' || COALESCE(v_session_name, 'ett pass') || '".',
        'workout_session_log',
        NEW.id,
        jsonb_build_object('client_name', v_client_name, 'session_name', v_session_name, 'date', NEW.date)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_client_logged_session
  AFTER INSERT OR UPDATE OF status ON workout_sessions_log
  FOR EACH ROW
  EXECUTE FUNCTION notify_client_logged_session();

-- Trigger 3: Readiness missing 2 days (notify coach)
-- This requires a scheduled job or we check on-demand
-- For MVP, we'll create a function that can be called periodically
CREATE OR REPLACE FUNCTION check_missing_readiness()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_client RECORD;
  v_coach_profile_id UUID;
  v_client_name TEXT;
  v_days_missing INTEGER;
BEGIN
  -- Find clients who haven't logged readiness in the last 2 days
  FOR v_client IN
    SELECT DISTINCT
      c.id AS client_id,
      c.profile_id AS client_profile_id,
      c.primary_coach_id AS coach_id,
      p.full_name AS client_name
    FROM clients c
    JOIN profiles p ON p.id = c.profile_id
    WHERE c.status = 'active'
      AND c.primary_coach_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM daily_readiness dr
        WHERE dr.client_id = c.id
          AND dr.date >= CURRENT_DATE - INTERVAL '2 days'
      )
  LOOP
    -- Check if notification already exists for this client in the last 24 hours
    IF NOT EXISTS (
      SELECT 1
      FROM notifications n
      WHERE n.profile_id = v_client.coach_id
        AND n.type = 'readiness_missing'
        AND n.related_entity_id = v_client.client_id::text::uuid
        AND n.created_at >= NOW() - INTERVAL '24 hours'
    ) THEN
      -- Calculate days missing
      SELECT COALESCE(
        EXTRACT(DAY FROM (CURRENT_DATE - MAX(dr.date))),
        999
      )::INTEGER INTO v_days_missing
      FROM daily_readiness dr
      WHERE dr.client_id = v_client.client_id;
      
      -- Create notification for coach
      PERFORM create_notification(
        v_client.coach_id,
        'readiness_missing',
        'Klient har inte loggat readiness',
        COALESCE(v_client.client_name, 'En klient') || ' har inte loggat readiness på ' || 
        CASE 
          WHEN v_days_missing >= 999 THEN 'mer än 2 dagar'
          WHEN v_days_missing = 2 THEN '2 dagar'
          ELSE v_days_missing::text || ' dagar'
        END || '.',
        'client',
        v_client.client_id,
        jsonb_build_object('client_name', v_client.client_name, 'days_missing', v_days_missing)
      );
    END IF;
  END LOOP;
END;
$$;

-- Note: This function should be called periodically (e.g., daily via cron or edge function)
-- For now, we'll create a simple way to call it manually or via API

