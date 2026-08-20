import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SkillGroupIcon } from "../components/SkillIcon";

describe("SkillGroupIcon", () => {
  it("renders a large coloured engineering icon for a main skill group", () => {
    const markup = renderToStaticMarkup(<SkillGroupIcon category="Embedded & Edge AI" />);

    expect(markup).toContain("skill-group-icon");
    expect(markup).toContain("color:");
    expect(markup).toContain("<svg");
  });

  it("uses a stable engineering fallback for an unknown group", () => {
    const markup = renderToStaticMarkup(<SkillGroupIcon category="Unmapped Category" />);

    expect(markup).toContain("skill-group-icon");
    expect(markup).toContain("<svg");
  });
});
