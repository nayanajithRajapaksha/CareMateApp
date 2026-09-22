import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key is missing from environment variables. Set SUPABASE_URL and SUPABASE_SECRET_KEY.');
    }

    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

export async function ensureAvatarsBucket(): Promise<string> {
  const supabase = getSupabase();
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'avatars';

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.warn('Warning: Could not list Supabase buckets:', listError.message);
      return bucketName;
    }

    const existingBucket = buckets?.find(b => b.name === bucketName || b.id === bucketName);
    if (!existingBucket) {
      console.log(`Bucket '${bucketName}' not found. Creating bucket...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
      });

      if (createError) {
        console.error(`Error creating bucket '${bucketName}':`, createError.message);
      } else {
        console.log(`Bucket '${bucketName}' successfully created.`);
      }
    } else if (!existingBucket.public) {
      console.log(`Updating bucket '${bucketName}' to public...`);
      await supabase.storage.updateBucket(bucketName, { public: true });
    }
  } catch (err) {
    console.error('Failed to ensure Supabase avatars bucket:', err);
  }

  return bucketName;
}

