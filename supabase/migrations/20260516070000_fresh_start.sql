-- =========================================================================
-- 1. CLEAN START
-- =========================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS forest_grid CASCADE;
DROP TABLE IF EXISTS gamification_state CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =========================================================================
-- 2. TABEL PROFILES
-- =========================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_gmail_connected BOOLEAN DEFAULT FALSE,
  monthly_income_target NUMERIC DEFAULT 0,
  monthly_savings_target NUMERIC DEFAULT 0,
  budget_reset_date INTEGER DEFAULT 1 CHECK (budget_reset_date >= 1 AND budget_reset_date <= 31),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =========================================================================
-- 3. TABEL TRANSACTIONS
-- =========================================================================
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_auto_sync BOOLEAN DEFAULT FALSE,
  gmail_message_id TEXT UNIQUE,
  receipt_image_url TEXT
);

-- =========================================================================
-- 4. TABEL GAMIFICATION STATE
-- =========================================================================
CREATE TABLE gamification_state (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  forest_health INTEGER DEFAULT 100,
  current_streak INTEGER DEFAULT 1,
  streak_shield INTEGER DEFAULT 1
);

-- =========================================================================
-- 5. TABEL FOREST GRID
-- =========================================================================
CREATE TABLE forest_grid (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  item_type TEXT NOT NULL,
  status TEXT DEFAULT 'healthy',
  CONSTRAINT unique_user_grid_coords UNIQUE (user_id, grid_x, grid_y)
);

-- =========================================================================
-- 6. TABEL GOALS
-- =========================================================================
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 0,
  current NUMERIC NOT NULL DEFAULT 0,
  color TEXT DEFAULT 'bg-primary',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =========================================================================
-- 7. TRIGGER HANDLE NEW USER
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    INSERT INTO public.gamification_state (user_id) VALUES (NEW.id);

    INSERT INTO public.forest_grid (user_id, grid_x, grid_y, item_type)
    VALUES (NEW.id, 0, 0, 'tree_1');

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 8. ROW LEVEL SECURITY
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE forest_grid ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own state" ON gamification_state FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own grid" ON forest_grid FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own goal" ON goals FOR ALL USING (auth.uid() = user_id);