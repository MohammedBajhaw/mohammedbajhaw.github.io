import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export function createPortfolioClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function publicMediaUrl(path?: string | null) {
  if (!path || !supabaseUrl || !supabaseKey) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/manus-storage/")) return `https://engportfolio-zhkmdjuy.manus.space${path}`;
  return createPortfolioClient().storage.from("portfolio-media").getPublicUrl(path).data.publicUrl;
}

export function publicDocumentUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/manus-storage/")) return `https://engportfolio-zhkmdjuy.manus.space${path}`;
  return publicMediaUrl(path);
}
