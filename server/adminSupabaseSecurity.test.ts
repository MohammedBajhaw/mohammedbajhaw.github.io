import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

describe("Supabase administrator protection", () => {
  it("rejects an anonymous content write", async () => {
    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from("skills").insert({
      label: "anonymous-write-must-be-rejected",
      category: "Security test",
      icon: "Test",
      sort_order: 999999,
    });

    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });
});
