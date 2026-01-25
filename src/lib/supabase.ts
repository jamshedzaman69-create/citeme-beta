import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  // Subscription fields
  subscription_status: string | null;     // 'active', 'trialing', etc.
  subscription_interval: string | null;   // 'week', 'month'
  current_period_end: string | null;      // From your current schema
  trial_ends_at: string | null;           // The new column you added
  stripe_customer_id: string | null;
  subscription_id: string | null;
}

export type Document = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};
