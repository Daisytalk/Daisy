-- Demo data for test1@gmail.com: daily check-ins (0–100) + weekly_report_snapshots (source = seed).
-- dynamics_metric_insights — «Daisy notices» (GET /api/account/dynamics-insights).
-- id: seed_sr_t1_* / seed_wrs_t1_*
-- Run: pnpm exec prisma db execute --file prisma/seed-test1-demo.sql --schema prisma/schema.prisma

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
  SELECT id INTO u_id FROM users WHERE email = 'test1@gmail.com';
  IF u_id IS NULL THEN
    RAISE EXCEPTION 'User test1@gmail.com not found';
  END IF;

  DELETE FROM stress_ratings WHERE "userId" = u_id AND id LIKE 'seed_sr_t1_%';

  FOR i IN 1..30 LOOP
    d := CURRENT_DATE - (30 - i);
    INSERT INTO stress_ratings (id, "userId", rating, source, "date", emotion, stress, energy, support, "createdAt")
    VALUES (
      'seed_sr_t1_' || LPAD(i::text, 2, '0'),
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
  SELECT id INTO u_id FROM users WHERE email = 'test1@gmail.com';
  IF u_id IS NULL THEN
    RAISE EXCEPTION 'User test1@gmail.com not found';
  END IF;

  INSERT INTO weekly_report_snapshots (id, "userId", period, summary, insights, recommendations, "dynamics_metric_insights", source, locale, "createdAt", "updatedAt")
  VALUES (
    'seed_wrs_t1_7d',
    u_id,
    '7d',
    $s7t$Over the last seven days your stress index eased into the mid-to-high 40s while emotional stability held in the high 60s and low 70s. That pattern suggests you are finishing the week with a bit more breathing room than you started, even though the load is still noticeable. Energy tracked in the low-to-mid 60s and support perception stayed strong in the low 70s — resources you can lean on deliberately next week.$s7t$,
    jsonb_build_array(
      'Stress moved from the low 50s toward the mid-40s in the most recent days — a gradual unwinding rather than a spike.',
      'Emotion and support scores stayed in a narrow band above 65, which usually means your baseline coping is engaged.'
    ),
    jsonb_build_array(
      'Keep one short “shutdown” ritual after work (10 minutes, same cue each day) so the stress curve does not flatten your recovery window.',
      'Name one concrete person or channel you actually used for support this week — repeat that move once more before the next stressful block.',
      'When energy dips below 60 on the index, swap one cognitive task for a 15-minute walk so the dip does not chain into evening fatigue.'
    ),
    jsonb_build_object(
      'emotion', $dm7e$This past week shows a gradual steadying of your emotional state. There have been ups and downs, but the overall direction is encouraging — it suggests you're starting to become more aware of your own reactions rather than just being swept along by them. A good next step is to notice which situations tend to trigger stronger responses. The more you recognize those patterns, the easier it becomes to move from reacting on autopilot to actually choosing how you respond.$dm7e$,
      'stress', $dm7s$Your stress levels have started to come down, though they're still sitting higher than what feels comfortable — which makes a lot of sense given the tension that's been building up. The fact that things are moving in the right direction means you're already doing something that works. Your system just needs a little more time to fully catch up. Adding short, intentional breaks throughout the day can really help speed that process along.$dm7s$,
      'energy', $dm7n$Energy is slowly coming back, but it's still a bit fragile and tends to dip when stress goes up. That's completely normal at this stage — the resource is returning, it just hasn't fully settled yet. Right now, the most valuable thing you can do is protect the basics: consistent sleep, a gentle start to your mornings, and not overloading your schedule before you've had a chance to recharge.$dm7n$,
      'support', $dm7p$You've been building a real sense of support through regular check-ins and reflection, and it's showing — this metric is actually moving faster than the others, which is a meaningful sign. Feeling supported isn't a soft bonus; it's one of the most direct ways to reduce stress and restore energy. Keep sharing what's on your mind. It genuinely makes a difference.$dm7p$
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
    "dynamics_metric_insights" = EXCLUDED."dynamics_metric_insights",
    "updatedAt" = NOW();

  INSERT INTO weekly_report_snapshots (id, "userId", period, summary, insights, recommendations, "dynamics_metric_insights", source, locale, "createdAt", "updatedAt")
  VALUES (
    'seed_wrs_t1_14d',
    u_id,
    '14d',
    $s14t$Across fourteen days the picture is a slow climb in emotional stability and perceived support, with stress slowly stepping down from the low 70s toward the high 40s. Energy rose from the high 30s into the mid-60s — not a straight line, but the direction matches someone who is rebuilding margin week over week. The interesting part is that stress and emotion moved in opposite directions without a collapse in energy, which often means you are reallocating attention rather than running on empty.$s14t$,
    jsonb_build_array(
      'Mid-period stress plateaued in the mid-50s before the late-period slide — worth noting what changed in your environment those days.',
      'Support crossed from the high 50s into the low 70s; small social investments may be compounding.'
    ),
    jsonb_build_array(
      'Schedule two “no-decision” blocks (45 minutes each) mid-week — protect them like meetings so stress does not eat planning capacity.',
      'Pair any task you dread with a fixed reward that does not scale with stress (same playlist, same tea) to anchor the habit loop.',
      'Once support hits 70+ on the index, add one proactive reach-out (message or call) within 24 hours while the buffer is real, not symbolic.'
    ),
    jsonb_build_object(
      'emotion', $dm14e$Over the past two weeks, your emotional landscape has started to even out in a noticeable way — the swings are less dramatic, and your reactions are becoming more predictable, even to yourself. That's a sign that early self-regulation patterns are taking root. The next layer to work on is understanding the why behind your emotions, not just noticing them. That shift deepens the sense of control considerably.$dm14e$,
      'stress', $dm14s$Stress has continued its downward trend and is moving out of the acute zone into something much more manageable. The cumulative effect of regular reflection is becoming real — you're bouncing back from difficult moments faster than before. Building in a simple evening wind-down routine, even just 10 minutes of offloading your thoughts, can help lock in those gains and keep the recovery momentum going.$dm14s$,
      'energy', $dm14n$Energy is finding a more stable rhythm and the sharp crashes are becoming less frequent. Your system is genuinely adapting and rebuilding its reserves. This is a good moment to get more intentional: which activities actually leave you feeling energized? The more you can consciously include those in your day, the more sustainable this recovery becomes.$dm14n$,
      'support', $dm14p$Something meaningful is forming here — a growing sense that there's a place to land when things get heavy. You're reaching out more readily and starting to see support as something available to you, not something you have to earn or wait for. That shift matters deeply. Keep using this space honestly. It's doing more for your overall resilience than it might seem.$dm14p$
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
    "dynamics_metric_insights" = EXCLUDED."dynamics_metric_insights",
    "updatedAt" = NOW();

  INSERT INTO weekly_report_snapshots (id, "userId", period, summary, insights, recommendations, "dynamics_metric_insights", source, locale, "createdAt", "updatedAt")
  VALUES (
    'seed_wrs_t1_30d',
    u_id,
    '30d',
    $s30t$The full month shows a coherent arc: stress eased from the low 70s toward the mid-40s, emotional stability strengthened from the low 40s into the high 60s and 70s, and energy climbed from the high 30s into the mid-60s. Support rose steadily from the high 20s into the mid-70s — the largest relative gain in the set. Taken together, this reads less like a crisis curve and more like a gradual recalibration: you kept showing up to the check-in while conditions improved in the background. The remaining gap is between peak stress days and peak support days — closing that gap is less about intensity and more about timing when you ask for help.$s30t$,
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
    jsonb_build_object(
      'emotion', $dm30e$A month in, and the change in your emotional baseline is real and hard-earned. The sharp swings have settled, the overall tone is calmer, and there's a growing sense that you're responding to life rather than just reacting to it. That reflects genuine behavioral shift, not just a good run of days. Staying attuned to your patterns now will help protect this progress and prevent the kind of slow drift that can undo it.$dm30e$,
      'stress', $dm30s$Stress is no longer running the show. It's dropped to a level where you can work with it rather than just survive it, and your recovery time after difficult situations has improved noticeably. The natural next move is to start getting ahead of your stress rather than just managing it after the fact — identifying and gradually reducing the sources, not just the symptoms.$dm30s$,
      'energy', $dm30n$Your energy has stabilized and is holding at a genuinely good level — that's a sign that your internal reserves have been meaningfully restored. You're more present, more capable, and less likely to hit a wall mid-day. The key now is keeping the balance: protecting the recovery habits that got you here so you don't gradually slide back into depletion.$dm30n$,
      'support', $dm30p$Over the past month, something solid has formed: a real support system that you actually use. You're no longer carrying everything alone, and that's not a small thing. This metric is quietly the foundation everything else is building on — it's what makes the other changes stick over time. Keep leaning on it. It's one of the most powerful resources you have.$dm30p$
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
    "dynamics_metric_insights" = EXCLUDED."dynamics_metric_insights",
    "updatedAt" = NOW();
END $$;

COMMIT;
