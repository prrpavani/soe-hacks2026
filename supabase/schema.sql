-- =============================================================
-- OpenTable — Supabase Schema
-- Run this in the Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → paste → Run
-- =============================================================

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  pronouns      TEXT,
  academic_level TEXT CHECK (academic_level IN ('UG', 'Grad', 'PhD')),
  avatar_url    TEXT,
  ask_me_about  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by all authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ── Active Hands ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS active_hands (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('Walk', 'Mindful', 'Nourish')),
  duration      INTEGER NOT NULL,   -- minutes
  expires_at    TIMESTAMPTZ NOT NULL,
  lat           DECIMAL(10, 8) NOT NULL,
  lng           DECIMAL(11, 8) NOT NULL,
  capacity      INTEGER DEFAULT 2,
  description   TEXT,
  location_name TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE active_hands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active hands viewable by all authenticated users"
  ON active_hands FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own hands"
  ON active_hands FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hands"
  ON active_hands FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hands"
  ON active_hands FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── Messages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- ── Table-level grants ───────────────────────────────────────
-- RLS policies alone aren't enough — Postgres also requires explicit
-- GRANT permissions on the table itself (separate from RLS).
GRANT SELECT ON profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON active_hands TO authenticated;

GRANT SELECT, INSERT ON messages TO authenticated;

-- ── Realtime ──────────────────────────────────────────────────
-- Enable realtime on these tables so pins pop up live
ALTER PUBLICATION supabase_realtime ADD TABLE active_hands;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ── Auto-cleanup function (optional) ─────────────────────────
-- Deletes expired hands every 5 minutes via pg_cron (if enabled)
-- SELECT cron.schedule('cleanup-expired-hands', '*/5 * * * *',
--   $$DELETE FROM active_hands WHERE expires_at < NOW()$$);
