import { createClient } from '@supabase/supabase-js';

// 클라이언트 사이드 Supabase 클라이언트 (공개 API만 접근 가능)
export const createClientSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL or Anon Key is not defined in environment variables.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

// 서버 사이드 Supabase 클라이언트 (서비스 롤 키로 더 많은 권한)
export const createServerSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(supabaseUrl!, supabaseServiceKey!);
};
