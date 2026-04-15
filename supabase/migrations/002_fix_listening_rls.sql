-- Fix listening session writes for anonymous (wallet-based) users.
--
-- Problem: The RLS INSERT policy on listening_sessions checks
-- wallet_address against JWT claims, but the anon key JWT has no
-- wallet_address claim, so all inserts from the frontend fail silently.
--
-- Solution: SECURITY DEFINER RPC functions that bypass RLS and are
-- callable from the anon role. The functions validate inputs themselves.

-- =============================================================
-- 1. create_listening_session
--    Upserts the user (get_or_create_user already exists) and
--    inserts a new listening_sessions row, returning its UUID.
-- =============================================================
CREATE OR REPLACE FUNCTION create_listening_session(user_wallet TEXT)
RETURNS UUID AS $$
DECLARE
  new_session_id UUID;
  user_uuid UUID;
BEGIN
  -- Ensure the user row exists (reuse existing helper)
  SELECT get_or_create_user(user_wallet) INTO user_uuid;

  INSERT INTO listening_sessions (
    user_id,
    wallet_address,
    started_at,
    duration_seconds
  ) VALUES (
    user_uuid,
    lower(user_wallet),
    NOW(),
    0
  )
  RETURNING id INTO new_session_id;

  RETURN new_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 2. update_listening_session
--    Updates the duration for an existing session and
--    increments the user's total listening time.
-- =============================================================
CREATE OR REPLACE FUNCTION update_listening_session(
  p_session_id UUID,
  p_duration INTEGER
)
RETURNS VOID AS $$
DECLARE
  session_wallet TEXT;
  old_duration INTEGER;
  delta INTEGER;
BEGIN
  -- Fetch the session to validate it exists and get the wallet
  SELECT wallet_address, duration_seconds
    INTO session_wallet, old_duration
    FROM listening_sessions
   WHERE id = p_session_id;

  IF session_wallet IS NULL THEN
    RAISE EXCEPTION 'Session not found: %', p_session_id;
  END IF;

  -- Only allow duration to increase (prevents replay / negative deltas)
  IF p_duration <= old_duration THEN
    RETURN;
  END IF;

  delta := p_duration - old_duration;

  -- Update the session row
  UPDATE listening_sessions
     SET duration_seconds = p_duration,
         ended_at = NOW()
   WHERE id = p_session_id;

  -- Increment the user's aggregate listening time by the delta
  PERFORM increment_listening_time(session_wallet, delta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to the anon and authenticated roles so the frontend
-- can call these via supabase.rpc().
GRANT EXECUTE ON FUNCTION create_listening_session(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_listening_session(UUID, INTEGER) TO anon, authenticated;
