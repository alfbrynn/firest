-- Add notification preference columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notif_spending_alert BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_budget_reminder BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_ai_insight BOOLEAN DEFAULT true;
