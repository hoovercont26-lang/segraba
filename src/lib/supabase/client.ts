import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfigured, supabasePublicKey, supabaseUrl } from "@/lib/supabase/env";

export { supabaseConfigured } from "@/lib/supabase/env";

export function createClient() {
  const url = supabaseUrl();
  const key = supabasePublicKey();
  if (!url || !key) {
    throw new Error("Falta conectar Supabase. Pon la URL y la publishable key en .env.local.");
  }
  return createBrowserClient(url, key);
}
