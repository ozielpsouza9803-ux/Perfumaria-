import { createClient } from '@supabase/supabase-js';

const CONFIRMED_SUPABASE_URL = 'https://elklmhiklhdnvmpgitoa.supabase.co';
const CONFIRMED_PUBLISHABLE_KEY = 'sb_publishable_R0e8JVDwlJXwrvkAOIwDAQ_fqYc_5qE';

const rawUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
  CONFIRMED_SUPABASE_URL;

const rawKey =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  (typeof process !== 'undefined' &&
    (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY)) ||
  CONFIRMED_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('MY_SUPABASE_URL') &&
  (rawUrl.startsWith('https://') || rawUrl.startsWith('http://'))
);

export const supabase = createClient(rawUrl, rawKey);


