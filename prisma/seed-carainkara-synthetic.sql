-- Synthetic daily_checkin + chat for carainkara@gmail.com (14 days: 2026-03-19 .. 2026-04-01)
-- Idempotent: deletes only rows with id prefix seed_sr_ / seed_conv_ / seed_msg_

BEGIN;

CREATE TEMP TABLE _seed_user AS
SELECT id AS uid FROM users WHERE email = 'carainkara@gmail.com';

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM _seed_user) <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one user for carainkara@gmail.com, got %', (SELECT COUNT(*) FROM _seed_user);
  END IF;
END $$;

DELETE FROM cbt_messages WHERE id LIKE 'seed_msg_%';
DELETE FROM cbt_conversations WHERE id LIKE 'seed_conv_%';
DELETE FROM stress_ratings WHERE id LIKE 'seed_sr_%';

INSERT INTO stress_ratings (id, "userId", rating, source, "date", emotion, stress, energy, support, "createdAt")
SELECT * FROM (VALUES
  ('seed_sr_01', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-19 00:00:00'::timestamp, 2, 5, 3, 3, '2026-03-19 21:47:38'::timestamp),
  ('seed_sr_02', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-20 00:00:00'::timestamp, 2, 5, 2, 4, '2026-03-20 08:23:14'::timestamp),
  ('seed_sr_03', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-21 00:00:00'::timestamp, 3, 4, 3, 3, '2026-03-21 11:06:52'::timestamp),
  ('seed_sr_04', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-22 00:00:00'::timestamp, 3, 5, 2, 3, '2026-03-22 19:31:09'::timestamp),
  ('seed_sr_05', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-23 00:00:00'::timestamp, 3, 4, 4, 4, '2026-03-23 07:44:27'::timestamp),
  ('seed_sr_06', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-24 00:00:00'::timestamp, 4, 4, 3, 4, '2026-03-24 22:18:43'::timestamp),
  ('seed_sr_07', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-25 00:00:00'::timestamp, 3, 4, 3, 3, '2026-03-25 13:29:11'::timestamp),
  ('seed_sr_08', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-26 00:00:00'::timestamp, 4, 3, 4, 4, '2026-03-26 18:02:56'::timestamp),
  ('seed_sr_09', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-27 00:00:00'::timestamp, 4, 4, 4, 3, '2026-03-27 06:15:33'::timestamp),
  ('seed_sr_10', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-28 00:00:00'::timestamp, 4, 3, 4, 5, '2026-03-28 23:41:07'::timestamp),
  ('seed_sr_11', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-29 00:00:00'::timestamp, 4, 3, 3, 4, '2026-03-29 14:53:22'::timestamp),
  ('seed_sr_12', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-30 00:00:00'::timestamp, 5, 3, 4, 4, '2026-03-30 20:09:48'::timestamp),
  ('seed_sr_13', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-03-31 00:00:00'::timestamp, 4, 3, 5, 4, '2026-03-31 09:37:19'::timestamp),
  ('seed_sr_14', (SELECT uid FROM _seed_user), 3, 'daily_checkin', '2026-04-01 00:00:00'::timestamp, 5, 2, 4, 5, '2026-04-01 20:26:44'::timestamp)
) AS v(id, "userId", rating, source, "date", emotion, stress, energy, support, "createdAt");

INSERT INTO cbt_conversations (id, "userId", "sessionId", persona, "createdAt", "updatedAt")
SELECT * FROM (VALUES
  ('seed_conv_01', (SELECT uid FROM _seed_user), 'seed_day_2026-03-19', 'active_listener', '2026-03-19 21:48:02'::timestamp, '2026-03-19 21:51:17'::timestamp),
  ('seed_conv_02', (SELECT uid FROM _seed_user), 'seed_day_2026-03-20', 'active_listener', '2026-03-20 08:23:41'::timestamp, '2026-03-20 08:26:55'::timestamp),
  ('seed_conv_03', (SELECT uid FROM _seed_user), 'seed_day_2026-03-21', 'active_listener', '2026-03-21 11:07:18'::timestamp, '2026-03-21 11:10:33'::timestamp),
  ('seed_conv_04', (SELECT uid FROM _seed_user), 'seed_day_2026-03-22', 'active_listener', '2026-03-22 19:31:44'::timestamp, '2026-03-22 19:34:58'::timestamp),
  ('seed_conv_05', (SELECT uid FROM _seed_user), 'seed_day_2026-03-23', 'active_listener', '2026-03-23 07:44:51'::timestamp, '2026-03-23 07:48:06'::timestamp),
  ('seed_conv_06', (SELECT uid FROM _seed_user), 'seed_day_2026-03-24', 'active_listener', '2026-03-24 22:19:03'::timestamp, '2026-03-24 22:22:41'::timestamp),
  ('seed_conv_07', (SELECT uid FROM _seed_user), 'seed_day_2026-03-25', 'active_listener', '2026-03-25 13:29:36'::timestamp, '2026-03-25 13:32:49'::timestamp),
  ('seed_conv_08', (SELECT uid FROM _seed_user), 'seed_day_2026-03-26', 'active_listener', '2026-03-26 18:03:21'::timestamp, '2026-03-26 18:06:12'::timestamp),
  ('seed_conv_09', (SELECT uid FROM _seed_user), 'seed_day_2026-03-27', 'active_listener', '2026-03-27 06:15:58'::timestamp, '2026-03-27 06:19:03'::timestamp),
  ('seed_conv_10', (SELECT uid FROM _seed_user), 'seed_day_2026-03-28', 'active_listener', '2026-03-28 23:41:31'::timestamp, '2026-03-29 00:44:18'::timestamp),
  ('seed_conv_11', (SELECT uid FROM _seed_user), 'seed_day_2026-03-29', 'active_listener', '2026-03-29 14:53:47'::timestamp, '2026-03-29 14:56:58'::timestamp),
  ('seed_conv_12', (SELECT uid FROM _seed_user), 'seed_day_2026-03-30', 'active_listener', '2026-03-30 20:10:14'::timestamp, '2026-03-30 20:13:27'::timestamp),
  ('seed_conv_13', (SELECT uid FROM _seed_user), 'seed_day_2026-03-31', 'active_listener', '2026-03-31 09:37:44'::timestamp, '2026-03-31 09:40:51'::timestamp),
  ('seed_conv_14', (SELECT uid FROM _seed_user), 'seed_day_2026-04-01', 'active_listener', '2026-04-01 20:27:01'::timestamp, '2026-04-01 20:30:19'::timestamp)
) AS v(id, "userId", "sessionId", persona, "createdAt", "updatedAt");

INSERT INTO cbt_messages (id, "conversationId", role, content, protocol, diagnosis, persona, is_anonymized, pii_detected, "createdAt")
SELECT * FROM (VALUES
  ('seed_msg_01a', 'seed_conv_01', 'user', 'Hi Daisy — rough day at work, but I want to wind down calmly.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-19 21:48:19'::timestamp),
  ('seed_msg_01b', 'seed_conv_01', 'assistant', 'I hear you. Let''s slow down together — what felt heaviest today?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-19 21:49:02'::timestamp),
  ('seed_msg_02a', 'seed_conv_02', 'user', 'Short check-in: tired, but okay overall.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-20 08:24:01'::timestamp),
  ('seed_msg_02b', 'seed_conv_02', 'assistant', 'Thanks for checking in. What would help you feel a little lighter tonight?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-20 08:24:47'::timestamp),
  ('seed_msg_03a', 'seed_conv_03', 'user', 'Weekend mood — a bit lighter.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-21 11:07:41'::timestamp),
  ('seed_msg_03b', 'seed_conv_03', 'assistant', 'That sounds like a meaningful shift. What supported that lightness?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-21 11:08:25'::timestamp),
  ('seed_msg_04a', 'seed_conv_04', 'user', 'Feeling overstimulated — want a simple grounding idea.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-22 19:32:08'::timestamp),
  ('seed_msg_04b', 'seed_conv_04', 'assistant', 'We can keep it tiny: 3 slow breaths, then name 3 things you see. Want to try?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-22 19:32:51'::timestamp),
  ('seed_msg_05a', 'seed_conv_05', 'user', 'Monday — busy but manageable.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-23 07:45:14'::timestamp),
  ('seed_msg_05b', 'seed_conv_05', 'assistant', 'Manageable counts. What helped you keep it steady?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-23 07:45:58'::timestamp),
  ('seed_msg_06a', 'seed_conv_06', 'user', 'I noticed I''m sleeping a bit better.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-24 22:19:28'::timestamp),
  ('seed_msg_06b', 'seed_conv_06', 'assistant', 'That''s great to hear. What changed recently around evenings?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-24 22:20:11'::timestamp),
  ('seed_msg_07a', 'seed_conv_07', 'user', 'Mid-week dip in energy — not a crisis.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-25 13:29:59'::timestamp),
  ('seed_msg_07b', 'seed_conv_07', 'assistant', 'Got it. Want a gentle plan for a 10-minute recovery break?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-25 13:30:42'::timestamp),
  ('seed_msg_08a', 'seed_conv_08', 'user', 'Feeling more hopeful today.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-26 18:03:44'::timestamp),
  ('seed_msg_08b', 'seed_conv_08', 'assistant', 'Hope can be quiet — what moment sparked it?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-26 18:04:27'::timestamp),
  ('seed_msg_09a', 'seed_conv_09', 'user', 'Work stress is still there but less sharp.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-27 06:16:21'::timestamp),
  ('seed_msg_09b', 'seed_conv_09', 'assistant', 'That ''less sharp'' matters. What boundary helped?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-27 06:17:04'::timestamp),
  ('seed_msg_10a', 'seed_conv_10', 'user', 'Good chat with a friend — felt supported.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-28 23:41:54'::timestamp),
  ('seed_msg_10b', 'seed_conv_10', 'assistant', 'Connection is real medicine. What did they say that landed?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-28 23:42:37'::timestamp),
  ('seed_msg_11a', 'seed_conv_11', 'user', 'Quiet Sunday — I needed that.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-29 14:54:11'::timestamp),
  ('seed_msg_11b', 'seed_conv_11', 'assistant', 'Rest can be productive. What felt restorative?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-29 14:54:54'::timestamp),
  ('seed_msg_12a', 'seed_conv_12', 'user', 'Trying to keep routines small and consistent.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-30 20:10:38'::timestamp),
  ('seed_msg_12b', 'seed_conv_12', 'assistant', 'Small consistency compounds. Which routine felt easiest today?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-30 20:11:21'::timestamp),
  ('seed_msg_13a', 'seed_conv_13', 'user', 'April already — feeling a bit more stable.', NULL, ARRAY[]::text[], NULL, false, false, '2026-03-31 09:38:08'::timestamp),
  ('seed_msg_13b', 'seed_conv_13', 'assistant', 'Stability shows up in small signals. What''s one you noticed?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-03-31 09:38:51'::timestamp),
  ('seed_msg_14a', 'seed_conv_14', 'user', 'Ending the day grateful — not perfect, but okay.', NULL, ARRAY[]::text[], NULL, false, false, '2026-04-01 20:27:24'::timestamp),
  ('seed_msg_14b', 'seed_conv_14', 'assistant', 'Okay counts. What are you proud of from today?', NULL, ARRAY[]::text[], 'active_listener', false, false, '2026-04-01 20:28:07'::timestamp)
) AS v(id, "conversationId", role, content, protocol, diagnosis, persona, is_anonymized, pii_detected, "createdAt");

COMMIT;
