import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SkillIcon } from "../components/SkillIcon";

describe("SkillIcon", () => {
  it("renders a coloured engineering icon for a recognised skill", () => {
    const markup = renderToStaticMarkup(<SkillIcon label="NVIDIA Jetson" iconName="NVIDIA" category="Embedded & Edge AI" />);

    expect(markup).toContain("skill-icon");
    expect(markup).toContain("color:");
    expect(markup).toContain("<svg");
  });

  it("uses a category-level engineering fallback for specialised skills", () => {
    const markup = renderToStaticMarkup(<SkillIcon label="Sensor Fusion" iconName="LiDAR" category="Autonomy & Navigation" />);

    expect(markup).toContain("skill-icon");
    expect(markup).toContain("<svg");
  });
});
