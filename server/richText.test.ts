import { describe, expect, it } from "vitest";
import { sanitizeProjectRichContent } from "../lib/richText";

describe("sanitizeProjectRichContent", () => {
  it("keeps supported project formatting while removing executable markup", () => {
    const output = sanitizeProjectRichContent('<h2>System</h2><p><strong>Validated</strong> payload.</p><script>alert(1)</script><img src="https://example.com/payload.jpg" onerror="alert(1)" />');

    expect(output).toContain("<h2>System</h2>");
    expect(output).toContain("<strong>Validated</strong>");
    expect(output).toContain('src="https://example.com/payload.jpg"');
    expect(output).not.toContain("script");
    expect(output).not.toContain("onerror");
  });
});
