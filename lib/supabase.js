import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublicKey) {
  throw new Error(
    "Supabase auth requires NEXT_PUBLIC_SUPABASE_URL and a public Supabase key."
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabasePublicKey);
