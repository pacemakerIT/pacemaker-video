import { s3clientSupabase } from '@/lib/supabase';
import { createGetHandler } from '../handler';

export const GET = createGetHandler(s3clientSupabase);
