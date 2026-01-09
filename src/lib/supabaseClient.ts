import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase env değerleri kontrol edilir, eksikse boş string kullanılır
// Lazy initialization - sadece ilk kullanıldığında yüklensin

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl || "", supabaseAnonKey || "");
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.supabase = supabaseInstance;
    }
  }
  return supabaseInstance;
})();

