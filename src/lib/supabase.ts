import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: SupabaseClient | null = null

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === 'https://your-project.supabase.co' ||
  supabaseAnonKey === 'your-anon-key'
) {
  // Ortam değişkenleri eksikse uygulamayı kırma — sadece uyarı ver
  console.warn('[supabase] Missing or placeholder Supabase env vars. Supabase features will be disabled.')
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
export default supabase
