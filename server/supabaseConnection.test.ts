import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

describe("Supabase public connection", () => {
  it("reads the public profiles table using the publishable key", async () => {
    expect(supabaseUrl).toMatch(/^https:\/\/.+\.supabase\.co$/);
    expect(publishableKey).toMatch(/^sb_publishable_/);

    const supabase = createClient(supabaseUrl!, publishableKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from("profiles").select("id").limit(1);

    expect(error).toBeNull();
  });
});
