import { describe, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('Inspect DB columns', () => {
  it('should print columns', async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log('PROFILES COLUMNS:', profileData ? Object.keys(profileData[0] || {}) : 'No data');

    const { data: gameData } = await supabase
      .from('gamification_state')
      .select('*')
      .limit(1);

    console.log('GAMIFICATION STATE COLUMNS:', gameData ? Object.keys(gameData[0] || {}) : 'No data');
  });
});
