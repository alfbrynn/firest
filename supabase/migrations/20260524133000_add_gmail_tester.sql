-- Tambahkan kolom is_gmail_tester ke tabel profiles
ALTER TABLE profiles ADD COLUMN is_gmail_tester BOOLEAN DEFAULT FALSE;
