-- =========================================================================
-- 9. TABEL INSIGHTS
-- =========================================================================
CREATE TABLE insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own insights" ON insights FOR ALL USING (auth.uid() = user_id);
