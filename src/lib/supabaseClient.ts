import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Env yoksa build-time uyarı için hata fırlatmak istemiyoruz; console warn yeterli.
  console.warn("Supabase env değerleri eksik: VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
if (typeof window !== "undefined") {
  // @ts-ignore
  window.supabase = supabase;
}

