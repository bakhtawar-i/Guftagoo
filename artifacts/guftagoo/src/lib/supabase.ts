import { createClient } from '@supabase/supabase-js';

// Both values are public by design (they ship in the browser bundle); the
// table's row-level security policy is what limits visitors to inserting.
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    'VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set. Copy .env.example to .env and fill them in.',
  );
}

export const supabase = createClient(url, publishableKey, {
  // Nobody logs in on the landing page, so skip storing auth sessions.
  auth: { persistSession: false, autoRefreshToken: false },
});
