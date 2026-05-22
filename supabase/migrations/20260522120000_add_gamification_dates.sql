-- Migration to add gamification date tracking to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_xp_date DATE;
