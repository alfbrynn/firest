-- Tambahkan kolom token OAuth Gmail ke tabel profiles untuk mendukung automatic refresh
ALTER TABLE profiles ADD COLUMN gmail_access_token TEXT;
ALTER TABLE profiles ADD COLUMN gmail_refresh_token TEXT;
ALTER TABLE profiles ADD COLUMN gmail_token_expires_at TIMESTAMP WITH TIME ZONE;
