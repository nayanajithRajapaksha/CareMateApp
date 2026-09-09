import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// The Supabase Project URL extracted from your Postgres connection string
const supabaseUrl = 'https://brurxutqthyejlrmibtl.supabase.co';

// TODO: Replace this with your actual 'anon' public key from the Supabase Dashboard
const supabaseAnonKey = 'sb_publishable_o3wdYo12lH1Id4nNFqxxng_NOEYzGhn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
