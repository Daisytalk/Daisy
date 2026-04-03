-- Demo data for carainkara@gmail.com: daily check-ins + weekly_report_snapshots (summary, insights, recommendations).
-- Чек-ины: индексы 0–100. Снимки отчёта: source = seed — API отдаёт их без вызова AI (см. weekly-report route).
-- Idempotent: stress_ratings id seed_sr_*; weekly snapshots upsert по (userId, period).
-- Run: pnpm exec prisma db execute --file prisma/seed-carainkara-demo.sql --schema prisma/schema.prisma

BEGIN;

DO $$
DECLARE
  u_id text;
  emotions int[] := ARRAY[42,43,45,44,46,47,48,50,52,51,53,54,55,56,58,60,59,61,62,63,65,64,66,67,68,67,69,70,69,68];
  stresses int[] := ARRAY[71,70,68,69,66,65,64,62,60,61,59,58,57,57,55,54,53,52,51,50,49,50,48,47,46,47,45,44,46,49];
  energies int[] := ARRAY[38,39,41,40,42,43,44,46,48,47,49,50,51,52,54,55,53,56,57,58,60,59,61,62,63,62,64,65,64,63];
  supports int[] := ARRAY[29,32,35,36,38,40,41,45,48,50,52,55,57,58,60,62,63,65,66,67,68,69,70,71,72,71,73,74,73,72];
  i int;
  d date;
BEGIN
  SELECT id INTO u_id FROM users WHERE email = 'test@gmail.com';
  IF u_id IS NULL THEN
    RAISE EXCEPTION 'User carainkara@gmail.com not found';
  END IF;

  DELETE FROM stress_ratings WHERE "userId" = u_id AND id LIKE 'seed_sr_%';

  FOR i IN 1..30 LOOP
    d := CURRENT_DATE - (30 - i);
    INSERT INTO stress_ratings (id, "userId", rating, source, "date", emotion, stress, energy, support, "createdAt")
    VALUES (
      'seed_sr_' || LPAD(i::text, 2, '0'),
      u_id,
      3,
      'daily_checkin',
      d::timestamp,
      emotions[i],
      stresses[i],
      energies[i],
      supports[i],
      (d::timestamp)
    );
  END LOOP;
END $$;

DO $$
DECLARE
  u_id text;
BEGIN
  SELECT id INTO u_id FROM users WHERE email = 'carainkara@gmail.com';
  IF u_id IS NULL THEN
    RAISE EXCEPTION 'User carainkara@gmail.com not found';
  END IF;

  INSERT INTO weekly_report_snapshots (id, "userId", period, summary, insights, recommendations, source, locale, "createdAt", "updatedAt")
  VALUES (
    'seed_wrs_carainkara_7d',
    u_id,
    '7d',
    $s7$Over the last seven days your stress index eased into the mid-to-high 40s while emotional stability held in the high 60s and low 70s. That pattern suggests you are finishing the week with a bit more breathing room than you started, even though the load is still noticeable. Energy tracked in the low-to-mid 60s and support perception stayed strong in the low 70s — resources you can lean on deliberately next week.$s7$,
    jsonb_build_array(
      'Stress moved from the low 50s toward the mid-40s in the most recent days — a gradual unwinding rather than a spike.',
      'Emotion and support scores stayed in a narrow band above 65, which usually means your baseline coping is engaged.'
    ),
    jsonb_build_array(
      'Keep one short “shutdown” ritual after work (10 minutes, same cue each day) so the stress curve does not flatten your recovery window.',
      'Name one concrete person or channel you actually used for support this week — repeat that move once more before the next stressful block.',
      'When energy dips below 60 on the index, swap one cognitive task for a 15-minute walk so the dip does not chain into evening fatigue.'
    ),
    'seed',
    'en',
    NOW(),
    NOW()
  )
  ON CONFLICT ("userId", period) DO UPDATE SET
    summary = EXCLUDED.summary,
    insights = EXCLUDED.insights,
    recommendations = EXCLUDED.recommendations,
    source = EXCLUDED.source,
    locale = EXCLUDED.locale,
    "updatedAt" = NOW();

  INSERT INTO weekly_report_snapshots (id, "userId", period, summary, insights, recommendations, source, locale, "createdAt", "updatedAt")
  VALUES (
    'seed_wrs_carainkara_14d',
    u_id,
    '14d',
    $s14$Across fourteen days the picture is a slow climb in emotional stability and perceived support, with stress slowly stepping down from the low 70s toward the high 40s. Energy rose from the high 30s into the mid-60s — not a straight line, but the direction matches someone who is rebuilding margin week over week. The interesting part is that stress and emotion moved in opposite directions without a collapse in energy, which often means you are reallocating attention rather than running on empty.$s14$,
    jsonb_build_array(
      'Mid-period stress plateaued in the mid-50s before the late-period slide — worth noting what changed in your environment those days.',
      'Support crossed from the high 50s into the low 70s; small social investments may be compounding.'
    ),
    jsonb_build_array(
      'Schedule two “no-decision” blocks (45 minutes each) mid-week — protect them like meetings so stress does not eat planning capacity.',
      'Pair any task you dread with a fixed reward that does not scale with stress (same playlist, same tea) to anchor the habit loop.',
      'Once support hits 70+ on the index, add one proactive reach-out (message or call) within 24 hours while the buffer is real, not symbolic.'
    ),
    'seed',
    'en',
    NOW(),
    NOW()
  )
  ON CONFLICT ("userId", period) DO UPDATE SET
    summary = EXCLUDED.summary,
    insights = EXCLUDED.insights,
    recommendations = EXCLUDED.recommendations,
    source = EXCLUDED.source,
    locale = EXCLUDED.locale,
    "updatedAt" = NOW();

  INSERT INTO weekly_report_snapshots (id, "userId", period, summary, insights, recommendations, source, locale, "createdAt", "updatedAt")
  VALUES (
    'seed_wrs_carainkara_30d',
    u_id,
    '30d',
    $s30$The full month shows a coherent arc: stress eased from the low 70s toward the mid-40s, emotional stability strengthened from the low 40s into the high 60s and 70s, and energy climbed from the high 30s into the mid-60s. Support rose steadily from the high 20s into the mid-70s — the largest relative gain in the set. Taken together, this reads less like a crisis curve and more like a gradual recalibration: you kept showing up to the check-in while conditions improved in the background. The remaining gap is between peak stress days and peak support days — closing that gap is less about intensity and more about timing when you ask for help.$s30$,
    jsonb_build_array(
      'Stress and emotion diverged early in the month then converged in the third week — a classic sign that cognitive load dropped before mood fully caught up.',
      'Support lagged emotion and energy for the first ten days, then accelerated; leverage that acceleration instead of waiting for another dip.'
    ),
    jsonb_build_array(
      'Write a one-page “stress budget” for next month: three non-negotiables and three flex slots so 45+ stress days do not erase the whole plan.',
      'Use the support index as a trigger: when it crosses 65, book something social within 48 hours — anticipation matters as much as attendance.',
      'For energy, alternate deep-work days with “maintenance” days (shallow tasks + recovery) so 60+ energy weeks do not collapse into boom-bust.',
      'Keep daily check-ins on low-stakes days too — the signal quality in weeks 3–4 depends on continuity, not drama.'
    ),
    'seed',
    'en',
    NOW(),
    NOW()
  )
  ON CONFLICT ("userId", period) DO UPDATE SET
    summary = EXCLUDED.summary,
    insights = EXCLUDED.insights,
    recommendations = EXCLUDED.recommendations,
    source = EXCLUDED.source,
    locale = EXCLUDED.locale,
    "updatedAt" = NOW();
END $$;

COMMIT;
