-- =============================================================
-- OpenSeat — Demo Seed Data (Public Health pivot)
-- =============================================================
-- HOW TO USE:
--   1. Run schema.sql first (one-time setup)
--   2. Go to Auth page in your app → click "Load Demo Credentials"
--      → click "Sign Up" to create the demo@ncsu.edu account
--      (or sign up manually with demo@ncsu.edu / OpenTable2026!)
--   3. Come back here and run this file in Supabase SQL Editor
--      Dashboard → SQL Editor → paste → Run
-- =============================================================

-- Temporarily disable RLS so seed inserts are not blocked by policies
ALTER TABLE profiles     DISABLE ROW LEVEL SECURITY;
ALTER TABLE active_hands DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages     DISABLE ROW LEVEL SECURITY;

-- ── Step 1: Create mock auth users ───────────────────────────
-- These are display-only demo accounts (no one logs in as them)

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, last_sign_in_at, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'authenticated', 'authenticated', 'alex.chen@ncsu.edu', '',
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'authenticated', 'authenticated', 'maya.patel@ncsu.edu', '',
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'authenticated', 'authenticated', 'jordan.rivera@ncsu.edu', '',
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'authenticated', 'authenticated', 'sam.okafor@ncsu.edu', '',
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'authenticated', 'authenticated', 'priya.nguyen@ncsu.edu', '',
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- ── Step 2: Create mock profiles ─────────────────────────────

INSERT INTO profiles (id, full_name, pronouns, academic_level, ask_me_about, created_at) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Alex Chen', 'he/him', 'PhD',
    'morning running routes on the Greenway, stress management during grad school, cold brew vs hot brew',
    now()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Maya Patel', 'she/her', 'UG',
    'hiking trails near campus, meal prepping on a student budget, yoga for beginners',
    now()
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Jordan Rivera', 'they/them', 'Grad',
    'mindfulness and study burnout recovery, finding healthy eats around campus, digital wellness',
    now()
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Sam Okafor', 'he/him', 'UG',
    'Carmichael Gym routines, sports nutrition on a budget, basketball pickup games on campus',
    now()
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Priya Nguyen', 'she/her', 'PhD',
    'evidence-based wellness habits, the best salad options at Talley, running as a grad school survival tool',
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ── Step 3: Create active wellness spots (expire 72h from now) ───

INSERT INTO active_hands (
  id, user_id, type, duration, expires_at, lat, lng, capacity, description, location_name
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Walk', 45,
    NOW() + INTERVAL '72 hours',
    35.7727, -78.6695,  -- Near Hunt Library / Greenway access
    3,
    'Heading out for a 30-min Greenway loop, going easy pace. All fitness levels welcome 🚶',
    'Greenway Trail — Hunt Library entrance'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Mindful', 30,
    NOW() + INTERVAL '72 hours',
    35.7860, -78.6626,  -- The Brickyard
    4,
    'Short guided breathing session, then just sitting in the sun. Phones away, brains off 🧘',
    'The Brickyard — East benches'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Nourish', 30,
    NOW() + INTERVAL '72 hours',
    35.7849, -78.6636,  -- Talley Student Union
    2,
    'Hitting the salad bar at Talley — tired of eating alone! Come find me by the smoothie station 🥗',
    'Talley Student Union — dining level'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Walk', 60,
    NOW() + INTERVAL '72 hours',
    35.7857, -78.6665,  -- Carmichael Gym area
    2,
    'Did weights, now doing a cool-down walk around the track. Good time to decompress and chat 💪',
    'Carmichael Gym — outdoor track'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Step 4: Pre-seed conversations so messaging is demo-ready ────────────────
-- Finds your demo@ncsu.edu account and inserts realistic back-and-forth messages.
-- Run this AFTER you create the demo@ncsu.edu account via Sign Up.

DO $$
DECLARE
  demo_id   UUID;
  sam_id    UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  alex_id   UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  priya_id  UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
BEGIN
  SELECT id INTO demo_id FROM auth.users WHERE email = 'demo@ncsu.edu';

  IF demo_id IS NULL THEN
    RAISE NOTICE '⚠️  demo@ncsu.edu not found. Sign up first, then re-run this seed.';
    RETURN;
  END IF;

  -- ── Conversation with Sam (walk together) ─────────────────
  INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES
    (sam_id,   demo_id, 'Hey! Saw your activity on the map 👋 You doing the Greenway loop too?',              NOW() - INTERVAL '12 minutes'),
    (demo_id,  sam_id,  'Yeah! Was going to go solo but honestly more fun with someone. What pace are you?',  NOW() - INTERVAL '11 minutes'),
    (sam_id,   demo_id, 'Easy pace today — just came off leg day 😅 Meet by the Hunt Library side entrance?', NOW() - INTERVAL '10 minutes'),
    (demo_id,  sam_id,  'Perfect, that works. Give me 5 minutes to grab water',                               NOW() - INTERVAL '9 minutes'),
    (sam_id,   demo_id, 'Sounds good! I have an extra snack bar if you want one 🍫',                          NOW() - INTERVAL '8 minutes'),
    (demo_id,  sam_id,  'You''re a lifesaver. See you there!',                                                NOW() - INTERVAL '7 minutes');

  -- ── Conversation with Alex (mindful break / walk coordination) ──
  INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES
    (alex_id,  demo_id, 'Hey! Are you going on the Greenway? I saw your pin 🏃',                              NOW() - INTERVAL '35 minutes'),
    (demo_id,  alex_id, 'Yeah, heading out in a bit. You want to join?',                                      NOW() - INTERVAL '33 minutes'),
    (alex_id,  demo_id, 'Definitely. I''ve been staring at my dissertation for 4 hours, I need air 😭',       NOW() - INTERVAL '31 minutes'),
    (demo_id,  alex_id, 'Same energy. I find walking actually helps me think through problems too',            NOW() - INTERVAL '29 minutes'),
    (alex_id,  demo_id, 'Exactly! Meet you at the Hunt entrance in 10?',                                      NOW() - INTERVAL '27 minutes');

  -- ── Conversation with Priya (healthy meal coordination) ───
  INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES
    (priya_id, demo_id, 'Hi! Heading to Talley for the salad bar, saw your post 🥗 wanna meet up?',           NOW() - INTERVAL '5 minutes'),
    (demo_id,  priya_id, 'Yes! The smoothie station? I''m 5 min away',                                        NOW() - INTERVAL '4 minutes'),
    (priya_id, demo_id, 'Perfect! They have the grain bowls today too, it''s a good day 🙌',                  NOW() - INTERVAL '3 minutes');

  RAISE NOTICE '✅ Demo conversations seeded for %', demo_id;
END $$;

-- Re-enable RLS (policies are back in effect for the app)
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages     ENABLE ROW LEVEL SECURITY;
